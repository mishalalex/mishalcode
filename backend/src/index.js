import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import executionRoutes from "./routes/execution.routes.js"
import submissionRoutes from "./routes/submission.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";

// setting up dotenv in order to use env file
dotenv.config();
// getting the PORT from dotenv file
const PORT = process.env.PORT;

// created an express server
const app = express();

// to accept request is json format
app.use(express.json());
app.use(cookieParser());

// healthcheck route
app.get('/', (req, res) => {
    res.send('Hello, welcome to MishalCode')
})

// auth routes
app.use('/api/v1/auth', authRoutes);

// problem routes
app.use('/api/v1/problems', problemRoutes);

// execution routes
app.use('/api/v1/execute-code', executionRoutes);

// submission routes
app.use('/api/v1/submissions', submissionRoutes);

// playlists routes
app.use('/api/v1/playlists', playlistRoutes);

// made the express server app listen to the PORT in env file
app.listen((PORT), () => {
    console.log(`Server is running at PORT: ${PORT}`)
})