import { UserRole } from '../generated/prisma/index.js';
import { db } from '../libs/db.js'
import { getJudge0LanguageId, pollBatchResults, submitBatch } from '../libs/judge0.lib.js';

// we are trying to create a problem and add it to db
export const createProblem = async (req, res) => {
    // get all the required fields from request
    const { title, description, difficulty, tags, examples, constraints, testcases, codeSnippets, referenceSolutions } = req.body;

    // check the user role once again (despite getting it checked by the middleware) for additional security

    if (req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ error: "You are not authorised to create a problem" })
    }

    // loop through each reference solution in different languages
    try {
        // 'referenceSolutions' is an object with 'language' as key and 'solutionCode' as value
        // 'Object.entries()' -> creates an ARRAY of key-value pairs from an object
        for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
            // get the language id from the language passed
            const languageId = getJudge0LanguageId(language);

            // return an error back to user if the language is not found
            if (!languageId) return res.status(400).json({ error: `Language ${language} is not supported!` })

            // return an error back to user if the type of test cases is an Array
            if (!Array.isArray(testcases)) return res.status(400).json({ error: `Testcases should be an array` })

            // we are crafting the data which needs to be sent out to judge0 using the data we got from user
            const submissions = testcases.map(({ input, output }) => ({
                source_code: solutionCode,
                language_id: languageId,
                stdin: input,
                expected_output: output
            }))

            // the results from judge0 comes as an array of 'tokens'
            const submissionResults = await submitBatch(submissions);

            // extracting the tokens out of the submission results
            const tokens = submissionResults.map((res) => res.token);

            // poll judje0 for all the submissions until all submissions are done
            const results = await pollBatchResults(tokens)

            // verify that the test cases have passed (id=3 means passed)
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                if (result.status.id !== 3) {
                    return res.status(400).json({ error: `Testcase ${i} failed for language ${language}` })
                }
            }

            // once all done, then save the problem in the database
            const newProblem = await db.problem.create({
                data: {
                    title,
                    description,
                    difficulty,
                    tags,
                    examples,
                    constraints,
                    testcases,
                    codeSnippets,
                    referenceSolutions,
                    userId: req.user.id,

                },
            });

            // return the problem object once it is stored in the database
            return res.status(201).json({
                success: true,
                message: "New problem is successfully added.",
                problem: newProblem
            });
        }
    } catch (error) {
        console.log(`Error occurred while creating the new problem: ${error}`);
        return res.status(500).json({
            error: "Error occured while creating the new problem. Contact admin"
        })

    }

    // for each language
}

export const getAllProblems = async (req, res) => {
    try {
        // query db to get the problems that are available
        const problems = await db.problem.findMany();

        // return an error if there are no problems to return
        if (!problems) {
            return res.status(404).json({
                error: "No problems found!"
            })
        }

        // return success message with the list of problems
        res.status(200).json({
            success: true,
            message: "fetched all the problems and are listed below:",
            count: problems.length,
            problems
        })

        // return it to user
    } catch (error) {
        console.log(`Error occurred while fetching all problems: ${error}`);
        return res.status(500).json({
            error: "Error occured while fetching all problems."
        })
    }

}

export const getAllProblemsSolvedByUser = async (req, res) => {

}

export const getProblemById = async (req, res) => {
    try {

    } catch (error) {
        console.log(`Error occurred while fetching the required problem: ${error}`);
        return res.status(500).json({
            error: "Error occured while fetching this problem."
        })
    }
}

export const updateProblemById = async (req, res) => {

}

export const deleteProblemById = async (req, res) => {

} 