import express from "express";
import { createProblem, getAllProblems, getSolvedProblemsByUser, getProblemById, updateProblemById, deleteProblemById } from "../controllers/problem.controller.js";
import { authMiddleware, checkAdmin } from "../middlewares/auth.middleware.js";

const problemRoutes = express.Router()

problemRoutes.post('/create-problem', authMiddleware, checkAdmin, createProblem);
problemRoutes.get('/get-all-problems', authMiddleware, getAllProblems);
problemRoutes.get('/get-problem/:problem_id', authMiddleware, getProblemById);
problemRoutes.put('/update-problem/:problem_id', authMiddleware, checkAdmin, updateProblemById);
problemRoutes.delete('/delete-problem/:problem_id', authMiddleware, checkAdmin, deleteProblemById);
problemRoutes.get('/get-solved-problems', authMiddleware, getSolvedProblemsByUser);

export default problemRoutes;