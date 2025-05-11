import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getAllPlaylistDetails, getPlaylistDetails, createPlaylist, addProblemToPlaylist, removeProblemFromPlaylist, deletePlaylist } from "../controllers/playlist.controller.js";

const playlistRoutes = express.Router();

playlistRoutes.get("/", authMiddleware, getAllPlaylistDetails);

playlistRoutes.get("/:playlistId", authMiddleware, getPlaylistDetails);

playlistRoutes.post("/create-playlist", authMiddleware, createPlaylist);

playlistRoutes.post("/:playlistId/add-problem", authMiddleware, addProblemToPlaylist);

playlistRoutes.post("/:playlistId/remove-problem", authMiddleware, removeProblemFromPlaylist);

playlistRoutes.delete("/:playlistId", authMiddleware, deletePlaylist);

export default playlistRoutes;