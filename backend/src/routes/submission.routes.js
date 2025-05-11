import express from "express";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getAllSubmissions, getSubmission, getAllTheSubmissionsForProblem } from "../controllers/submissions.controller.js"

const submissionRoutes = express.Router();

submissionRoutes.get('/get-all-submissions', authMiddleware, getAllSubmissions);
submissionRoutes.get('/get-submission/:problemId', authMiddleware, getSubmission);
submissionRoutes.get('/get-submissons-count/:problemId', authMiddleware, getAllTheSubmissionsForProblem);

export default submissionRoutes;