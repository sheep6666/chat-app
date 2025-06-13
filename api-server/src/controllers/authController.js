const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/User');
const logger = require('../config/logger');

function validateRegistrationFields(fields, file) {
    const { userName, email, password, confirmPassword } = fields;
    const errors = [];

    if (!userName) errors.push("User name is required");
    if (!email) errors.push("Email is required");
    else if (!validator.isEmail(email)) errors.push("Email is not valid");

    if (!password) errors.push("Password is required");
    else if (password.length < 6) errors.push("Password must be at least 6 characters");

    if (!confirmPassword) errors.push("Confirm password is required");
    else if (password !== confirmPassword) errors.push("Password and confirm password do not match");

    if (!file) errors.push('Image is required');

    return errors;
}

function validateLoginFields({ email, password }) {
    const errors = [];

    if (!email) errors.push("Please provide your Email");
    else if (!validator.isEmail(email)) errors.push("Please provide a valid Email");

    if (!password) errors.push("Please provide your Password");

    return errors;
}

function createAuthToken(user) {
    const userData = {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt || new Date(Date.now())
    }
    const token = jwt.sign(
        userData,
        process.env.JWT_SECRET,
        { expiresIn: process.env.TOKEN_EXP }
    );
    return token
}

module.exports.registerUser = async (req, res) => {
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
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        };

        logger.info(`User registered: ${newUser.email} (ID: ${newUser._id})`);
        return res.status(200).cookie('authToken', token, cookieOptions).json({
            success: true,
            message: "User created successfully",
            data: { token }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error during registration",
            errors: [error.message]
        });
    }
};

module.exports.loginUser = async (req, res) => {
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
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        };
        logger.info(`User logged in: ${email} (ID: ${user._id})`);
        return res.status(200).cookie('authToken', token, cookieOptions).json({
            success: true,
            message: "Login successful",
            data: { token }
        });
    } catch (error) {
        logger.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            errors: [error.message || "Unexpected server error"]
        });
    }
};

module.exports.logoutUser = (req, res) => {
    const expiredCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
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