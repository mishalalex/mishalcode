import express from "express";
import dotenv from "dotenv";

// setting up dotenv in order to use env file
dotenv.config();
// getting the PORT from dotenv file
const PORT = process.env.PORT;

// created an express server
const app = express();

// made the express server app listen to the PORT in env file
app.listen((PORT), () => {
    console.log(`Server is running at PORT: ${PORT}`)
})