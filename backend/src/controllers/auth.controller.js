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
        // if yes, then stop user from registering and throw an error
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

export const login = async (req, res) => { }

export const logout = async (req, res) => { }

export const check = async (req, res) => { }