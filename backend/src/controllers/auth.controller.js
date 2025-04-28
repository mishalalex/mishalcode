import bcrypt from 'bcryptjs';
import { db } from '../libs/db.js'
import { UserRole } from '../generated/prisma/index.js';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    // destructure from request what is needed
    const { email, password, name } = req.body;

    // check whether user exists by querying db
    try {
        const existingUser = await db.user.findUnique({
            where: {
                email
            }
        });
        // if yes, then stop user from registering and return an error
        if (existingUser) {
            return res.status(400).json({
                error: "User already registered."
            })
        }

        // if no user is found, then create a hash for the password to securely store in db
        const hashedPassword = await bcrypt.hash(password, 10);

        // make a db entry with the new user details
        const newUser = await db.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: UserRole.USER
            }
        });

        // create JWT token
        const token = jwt.sign({
            id: newUser.id
        }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        })

        // configure cookies to be sent on success using JWT token we created above with its expiry
        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        })

        // return 201 once the user is created successfully
        res.status(201).json({
            message: "User created successfully",
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                image: newUser.image
            }
        })
    } catch (error) {
        console.log(`Error creating new user ${error}`);
        res.status(500).json({
            error: "Error while creating new user record"
        })
    }

}

export const login = async (req, res) => {
    // get the required details from request
    const { email, password } = req.body;
    try {
        // check whether the user exists by querying the dv with user email
        const existingUser = await db.user.findUnique({
            where: {
                email
            }
        })

        // if not found then return an error
        if (!existingUser) {
            return res.status(404).json({
                error: "User not found"
            })
        }

        // check whether the passwords match by comparing the hash of the password user gave with the one stored in db
        const isPasswordMatch = await bcrypt.compare(password, existingUser.password);

        // return an error if the password hash doesn't match
        if (!isPasswordMatch) {
            return res.status(400).json({
                error: "Invalid credentials!"
            })
        }

        // create a new token to be given when user logs in
        const token = jwt.sign({ id: existingUser.id }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        })

        // configure cookies to be sent on success using JWT token we created above with its expiry
        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        })

        // return 200 once the user is created successfully
        res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: existingUser.id,
                email: existingUser.email,
                name: existingUser.name,
                role: existingUser.role,
                image: existingUser.image
            }
        })
    } catch (error) {
        console.log("Error while logging in the user");
        res.status(500).json({
            error: "Error while logging the user in"
        })
    }
}

export const logout = async (req, res) => { }

export const check = async (req, res) => { }