const bcrypt = require('bcrypt');
const User = require('../models/User');
const logger = require('../config/logger');
const { 
    validateRegistrationFields,
    validateLoginFields,
    createAuthToken
} = require("./utils");

async function registerUser(req, res){
    try {
        const validationErrors = validateRegistrationFields(req.body, req.file || {});
        if (validationErrors.length > 0) {
            logger.warn(`Registration failed: Validation errors - ${validationErrors.join(' | ')}`);
            return res.status(400).json({ 
                success: false,
                message: "Validation failed",
                errors: validationErrors
            });
        }
        
        const { userName, email, password } = req.body;
        const avatar = req.file ? req.file.filename : `default_avatar.jpg`;

        // Check if the user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            logger.warn(`Registration failed: Email already in use (${email})`);
            return res.status(400).json({
                success: false,
                message: "User already exists",
                errors: ["Email is already in use"]
            });
        }

        // Hash password and add a new user into DB
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            userName,
            email,
            password: hashedPassword,
            avatar: avatar
        });

        // Create a JWT 
        const token = createAuthToken(newUser);
        const cookieOptions = {
            expires: new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'prod',
            sameSite: 'lax'
        };

        logger.info(`User registered: ${newUser.email} (ID: ${newUser._id})`);
        return res.status(200).cookie('authToken', token, cookieOptions).json({
            success: true,
            message: "User created successfully",
            data: { token }
        });
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({
            success: false,
            message: "Server error during registration",
            errors: [error.message]
        });
    }
};

async function loginUser(req, res){
    const { email, password } = req.body;
    const validationErrors = validateLoginFields({ email, password });
    if (validationErrors.length > 0) {
        logger.warn(`Login failed: Validation errors - ${validationErrors.join(' | ')}`);
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: validationErrors
        });
    }

    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            logger.warn(`Login failed: Email not found (${email})`);
            return res.status(400).json({
                success: false,
                message: "Login failed",
                errors: ["Email not found"]
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            logger.warn(`Login failed: Invalid password for email (${email})`);
            return res.status(400).json({
                success: false,
                message: "Login failed",
                errors: ["Invalid password"]
            });
        }

        const token = createAuthToken(user);

        const cookieOptions = {
            expires: new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'prod',
            sameSite: 'lax'
        };
        logger.info(`User logged in: ${email} (ID: ${user._id})`);
        return res.status(200).cookie('authToken', token, cookieOptions).json({
            success: true,
            message: "Login successful",
            data: { token }
        });
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            errors: [error.message || "Unexpected server error"]
        });
    }
};

function logoutUser(req, res){
    const expiredCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'prod',
        sameSite: 'lax',
        expires: new Date(0), // 設定為過期時間
    };

    // Optional: log who logged out (if authMiddleware ran before this)
    if (req.userId) {
        logger.info(`User logged out: ${req.userId}`);
    } else {
        logger.info('User logout attempted (no userId available)');
    }

    return res
        .status(200)
        .cookie('authToken', '', expiredCookieOptions)
        .json({
            success: true,
            message: "Logout successful",
        });
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser
}