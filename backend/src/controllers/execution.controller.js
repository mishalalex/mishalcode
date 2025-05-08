import { db } from "../libs/db.js";
import {
    getJudge0LanguageName,
    pollBatchResults,
    submitBatch,
} from "../libs/judge0.lib.js";

export const executeCode = async (req, res) => {
    try {
        const { source_code, language_id, stdin, expected_outputs, problemId } =
            req.body;

        const userId = req.user.id;

        // Validate test cases

        if (
            !Array.isArray(stdin) ||
            stdin.length === 0 ||
            !Array.isArray(expected_outputs) ||
            expected_outputs.length !== stdin.length
        ) {
            return res.status(400).json({ error: "Invalid or Missing test cases" });
        }

        // 2. Prepare each test cases for judge0 batch submission
        const submissions = stdin.map((input) => ({
            source_code,
            language_id,
            stdin: input,
        }));

        // 3. Send batch of submissions to judge0
        const submitResponse = await submitBatch(submissions);

        const tokens = submitResponse.map((res) => res.token);

        // 4. Poll judge0 for results of all submitted test cases
        const results = await pollBatchResults(tokens);

        console.log("Result-------------");
        console.log(results);

        //  Analyze test case results to check whether all the testcases are passed
        // and return a formatted response if it did
        let allPassed = true;
        const detailedResults = results.map((result, i) => {
            const stdout = result.stdout?.trim();
            const expected_output = expected_outputs[i]?.trim();
            const passed = stdout === expected_output;

            if (!passed) allPassed = false;

            return {
                testCase: i + 1,
                passed,
                stdout,
                expected: expected_output,
                stderr: result.stderr || null,
                compile_output: result.compile_output || null,
                status: result.status.description,
                memory: result.memory ? `${result.memory} KB` : undefined,
                time: result.time ? `${result.time} s` : undefined,
            };

            // console.log(`Testcase #${i+1}`);
            // console.log(`Input for testcase #${i+1}: ${stdin[i]}`)
            // console.log(`Expected Output for testcase #${i+1}: ${expected_output}`)
            // console.log(`Actual output for testcase #${i+1}: ${stdout}`)

            // console.log(`Matched testcase #${i+1}: ${passed}`)
        });

        console.log(detailedResults);

        // store submission summary into submission table in our db
        const submission = await db.submission.create({
            data: {
                userId,
                problemId,
                sourceCode: source_code,
                language: getJudge0LanguageName(language_id),
                stdin: stdin.join("\n"),
                stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),
                stderr: detailedResults.some((r) => r.stderr)
                    ? JSON.stringify(detailedResults.map((r) => r.stderr))
                    : null,
                compileOutput: detailedResults.some((r) => r.compile_output)
                    ? JSON.stringify(detailedResults.map((r) => r.compile_output))
                    : null,
                status: allPassed ? "Accepted" : "Wrong Answer",
                memory: detailedResults.some((r) => r.memory)
                    ? JSON.stringify(detailedResults.map((r) => r.memory))
                    : null,
                time: detailedResults.some((r) => r.time)
                    ? JSON.stringify(detailedResults.map((r) => r.time))
                    : null,
            },
        });

        // if all test cases have passed, then mark the problem as solved for the current user
        if (allPassed) {
            await db.problemSolved.upsert({
                where: {
                    userId_problemId: {
                        userId,
                        problemId,
                    },
                },
                update: {},
                create: {
                    userId,
                    problemId,
                },
            });
        }


        // format and hold the testcase results into a variable
        const testCaseResults = detailedResults.map((result) => ({
            submissionId: submission.id,
            testCase: result.testCase,
            passed: result.passed,
            stdout: result.stdout,
            expected: result.expected,
            stderr: result.stderr,
            compileOutput: result.compile_output,
            status: result.status,
            memory: result.memory,
            time: result.time,
        }));

        // save individual test case results into testcaseresult table in our db
        await db.testCaseResult.createMany({
            data: testCaseResults,
        });

        // query the submission table get the submission result with the test case status 
        // this also verifies whether the data got correctly stored in our db
        const submissionWithTestCase = await db.submission.findUnique({
            where: {
                id: submission.id,
            },
            include: {
                testCases: true,
            },
        });

        // return the query result with the user along with other standard output
        res.status(200).json({
            success: true,
            message: "Code Executed! Successfully!",
            submission: submissionWithTestCase,
        });
    } catch (error) {
        console.error("Error executing code:", error.message);
        res.status(500).json({ error: "Failed to execute code" });
    }
};