import { db } from "../libs/db.js";

export const getAllPlaylistDetails = async (req, res) => {

    try {
        // get the playlists created by the user
        const playlists = await db.playlist.findMany({
            where: {
                userId: req.user.id
            },
            include: {
                problems: {
                    include: {
                        problem: true
                    }
                }
            }
        })

        // validate if there are any playlist created by user
        if (playlists.length === 0) return res.status(404).json({ error: "No playlist found" })

        // return the fetched playlists
        return res.status(201).json({
            success: true,
            message: "Playlists fetched successfully",
            count: playlists.length,
            playlists
        })

    } catch (error) {
        console.error(`Error while fetching all playlists: ${error}`);
        res.status(500).json({
            error: `Error while fetching playlists`
        });
    }
}

export const getPlaylistDetails = async (req, res) => {
    try {
        // get the playlist from the request params
        const { playlistId } = req.params;

        // get the playlist details from db using the playlist id
        const playlistDetails = await db.playlist.findUnique({
            where: {
                id: playlistId,
                userId: req.user.id
            },
            include: {
                problems: {
                    include: {
                        problem: true
                    }
                }
            }
        })

        // return an error if no playlist are found
        if (!playlistDetails) return res.status(404).json({ error: "Playlist not found!" });

        // if found then return the response
        return res.status(200).json({
            success: true,
            message: "Playlist details fetched successfully",
            count: playlistDetails.problems.length,
            playlistDetails
        })

    } catch (error) {
        console.error(`Error while fetching the solved problems: ${error}`);
        res.status(500).json({
            error: `Error while fetching the solved problems`
        });
    }
}

export const createPlaylist = async (req, res) => {
    try {
        // get the name and description from the request body
        const { name, description } = req.body;

        // return an error if mandatory parameters are not passed
        if (!name) return res.status(400).json({ error: "name is required" })

        // get the user id from the request
        const userId = req.user.id;

        // save the playlist in db
        const playlist = await db.playlist.create({
            data: {
                name,
                description,
                userId
            }
        })

        // return a success message to user once the playlist is saved
        res.status(200).json({
            success: true,
            message: "Playlist created successfully",
            playlist
        })

    } catch (error) {
        console.error(`Error while fetching the solved problems: ${error}`);
        res.status(500).json({
            error: `Error while fetching the solved problems`
        });
    }
}

export const addProblemToPlaylist = async (req, res) => {
    try {
        // get the playlist id from the request params
        const { playlistId } = req.params;

        // validate whether user has sent a playlist id
        if (!playlistId) return res.status(400).json({ error: "Playlist is mandatory" })

        // get the problem ids from the requst body
        const { problemIds } = req.body;

        // verify whether the problem ids are sent as an array and there is content inside the array
        if (!Array.isArray(problemIds) || problemIds.length === 0) {
            return res.status(400).json({ error: "Invalid or missing problem ids" });
        }

        // add non-pre-existing problems to the playlist
        const problemsInPlaylist = await db.problemsInPlaylist.createMany({
            data: problemIds.map((problemId) => ({
                playlistId, problemId
            }))
        })

        // return success message back to user
        res.status(201).json({
            success: true,
            message: "Problem added to playlist successfully",
            problemsInPlaylist
        })

    } catch (error) {
        console.error(`Error while adding problem to playlist: ${error}`);
        res.status(500).json({
            error: `Error while adding problem to playlist`
        });
    }
}
export const removeProblemFromPlaylist = async (req, res) => {
    try {
        // get the playlist id from request params
        const { playlistId } = req.params;

        // get the problem ids from request body
        const { problemIds } = req.body;

        // return error if issue
        if (!Array.isArray(problemIds) || problemIds.length === 0) {
            return res.status(400).json({ error: "Invalid or missing problem ids" })
        }

        // search in db the problems mentioned in the problemIds array
        const existingProblem = await db.problemsInPlaylist.findMany({
            where: {
                playlistId,
                problemId: {
                    in: problemIds
                }
            }
        });

        // return an error if no problems are returned
        if (existingProblem.length === 0) return res.status(404).json({ error: "Problem not found in playlist" });

        // delete from db the problems mentioned in the problemIds array
        const deletedProblems = await db.problemsInPlaylist.deleteMany({
            where: {
                playlistId,
                problemId: {
                    in: problemIds
                }
            }
        });

        // return success response back to the user
        return res.status(200).json({
            success: true,
            message: "Problems deleted from playlist",
            deletedProblems
        })

    } catch (error) {
        console.error(`Error while removing the problem from playlist: ${error}`);
        res.status(500).json({
            error: `Error while removing the problem from playlist`
        });
    }
}

export const deletePlaylist = async (req, res) => {
    try {
        // get the playlist from request param
        const { playlistId } = req.params;

        // search the db for the given playlist
        const playlist = await db.playlist.findUnique({
            where: {
                id: playlistId
            }
        })

        // return an error to the user if the playlist is not found
        if (!playlist) return res.status(404).json({ error: "Playlist not found" });

        // if found, then delete the playlist from the table
        const deletedPlaylist = await db.playlist.delete({
            where: {
                id: playlistId
            }
        });

        // return success message to the user once the playlist is deleted
        res.status(200).json({
            success: true,
            message: "Playlist deleted successdfully",
            deletedPlaylist
        })

    } catch (error) {
        console.error(`Error while fetching the solved problems: ${error}`);
        res.status(500).json({
            error: `Error while fetching the solved problems`
        });
    }
}