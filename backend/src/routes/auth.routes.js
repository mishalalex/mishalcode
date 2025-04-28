import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { login, logout, register, check } from '../controllers/auth.controller.js';

const authRoutes = express.Router();

authRoutes.post('/register', register)

authRoutes.post('/login', login)

authRoutes.get('/logout', authMiddleware, logout)

authRoutes.get('/check', authMiddleware, check)

export default authRoutes;