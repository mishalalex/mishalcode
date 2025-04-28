import jwt from 'jsonwebtoken';
import { db } from '../libs/db.js';

export const authMiddleware = async (req, res, next) => {

    try {
        // get the jwt token stored in user's computer from the request
        const token = req.cookies.jwt;

        // return an error if there is no token present
        if (!token) {
            return res.status(401).json({
                message: "Unauthorised - no token found"
            })
        }

        // initialize the variable to store the decoded jwt token
        let decodedToken;

        try {
            // decode the jwt token using the jwt secret in the .env file
            decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        } catch (error) {
            // return error if the token couldn't be decoded
            return res.status(401).json({
                message: "Unauthorised - invalid token"
            })
        }

        // fetch the user details from the db by querying with the id we got from the jwt token
        const user = await db.user.findUnique({
            where: {
                id: decodedToken.id
            },
            // make sure to NOT select password as it is a security risk
            select: {
                id: true,
                image: true,
                name: true,
                email: true,
                role: true
            }
        });

        // if user is not found then throw an error
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        // attach the user details in the request
        req.user = user;

        // call the next to continue the request
        next();

    } catch (error) {
        console.log(`Error while authenticating user: ${error}`);
        res.status(500).json({
            error: "Error while authenticating user"
        })
    }
}