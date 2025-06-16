import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import connectDB from "./conn.mjs";

dotenv.config();
const router = express.Router();

// user registration
router.post('/register', async (req, res) => {
    const { firstname, lastname, username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await createUser(firstname, lastname, username, email, hashedPassword);
        res.status(201).send('User created successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// user login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await findUserByUsername(username);
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

const db = await connectDB();
const users = db.collection("users");

async function createUser(firstname, lastname, username, email, passwordHash) {
    return await users.insertOne({ firstname, lastname, username, email, password: passwordHash });
}

async function findUserByUsername(username) {
    return await users.findOne({ username });
}




export default router;