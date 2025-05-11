import { db } from "../libs/db.js";
export const getAllSubmissions = async (req, res) => {
    try {
        const userId = req.user.id;
        const submissions = await db.submission.findMany({
            where: {
                userId
            }
        })

        if (!userId) return res.status(400).json({ error: "User not found" });

        res.status(200).json({
            success: true,
            message: "Submissions are fetched successfully",
            submissions
        })

    } catch (error) {
        console.error("Fetch submissions failed with error: ", error);
        res.status(500).json({ error: "Failed to fetch submissions" });
    }
};

export const getSubmission = async (req, res) => {
    try {
        const userId = req.user.id;
        const problemId = req.params.problemId;
        const submissions = await db.submission.findMany({
            where: {
                userId,
                problemId
            }
        });

        if (!submissions || !submissions[0]) return res.status(400).json({ error: "No submissions found for the problem id" });

        res.status(200).json({
            success: true,
            message: "Submission fetched successfully",
            submissions
        })

    } catch (error) {
        console.error("Fetch submissions failed with error: ", error);
        res.status(500).json({ error: "Failed to fetch submissions" });
    }
};

export const getAllTheSubmissionsForProblem = async (req, res) => {
    try {
        const problemId = req.params.problemId;
        const submissionCount = await db.submission.count({
            where: {
                problemId
            }
        })

        res.status(200).json({
            success: true,
            message: "Submissions fetched successfully",
            count: submissionCount
        })

    } catch (error) {
        console.error("Fetch submissions failed with error: ", error);
        res.status(500).json({ error: "Failed to fetch submissions" });
    }
};