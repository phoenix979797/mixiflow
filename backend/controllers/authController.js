const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { users } = require('../models');
const logger = require('../utils/logger');
const { OAuth2Client } = require('google-auth-library');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await users.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(404).json({ message: 'Invalid email or password' });
        }

        if (user.status === "block") {
            return res.status(404).json({ message: 'Sorry, You are blocked. Please contact support team' });
        }

        await users.update({ lastLogin: new Date() }, { where: { id: user.id } });

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        logger.error('Login error:', { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Failed to login" });
    }
};

exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await users.findOne({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await users.create({ email, password: hashedPassword });

        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        logger.error('Register error:', { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Failed to register" });
    }
};

exports.googleLogin = async (req, res) => {
    const { access_token } = req.body;
    try {
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const userInfoResponse = await client.getTokenInfo(access_token);
        const email = userInfoResponse.email;

        let user = await users.findOne({ where: { email } });
        
        // If user doesn't exist, create one
        if (!user) {
            const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10);
            user = await users.create({ 
                email,
                password: hashedPassword // Random password for Google users
            });
        }

        if (user.status === "block") {
            return res.status(403).json({ message: 'Sorry, You are blocked. Please contact support team' });
        }

        await users.update({ lastLogin: new Date() }, { where: { id: user.id } });
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        logger.error('Google login error:', { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Failed to login with Google" });
    }
};

exports.microsoftLogin = async (req, res) => {
    const { access_token } = req.body;
    try {
        const client = new OAuth2Client(process.env.MICROSOFT_CLIENT_ID);
        const userInfoResponse = await client.getTokenInfo(access_token);
        const email = userInfoResponse.email;

        let user = await users.findOne({ where: { email } });

        if (!user) {
            const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10);
            user = await users.create({ 
                email,
                password: hashedPassword // Random password for Google users
            });
        }

        if (user.status === "block") {
            return res.status(403).json({ message: 'Sorry, You are blocked. Please contact support team' });
        }

        await users.update({ lastLogin: new Date() }, { where: { id: user.id } });
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        logger.error('Microsoft login error:', { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Failed to login with Microsoft" });

    }
};
