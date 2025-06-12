const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

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
        const { userName, email, password } = req.body;
        const avatar = req.file ? req.file.filename : `default.jpg`;

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            userName,
            email,
            password: hashedPassword,
            avatar: avatar
        });

        const token = createAuthToken(newUser);
        const cookieOptions = {
            expires: new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        };

        return res.status(200).cookie('authToken', token, cookieOptions).json({
            successMessage: "User created successfully",
            token
        });
    } catch (error) {
        logger.error(`Register error: ${error.message}`);
        return res.status(500).json({
            errors: { errorMessage: ["Server error during registration"] }
        });
    }
};

module.exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select('+password');
        const token = createAuthToken(user);

        const cookieOptions = {
            expires: new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        };
        logger.info(`User logged in: ${email} (ID: ${user._id})`);
        return res.status(200).cookie('authToken', token, cookieOptions).json({
            successMessage: "Login successful",
            token
        });
    } catch (error) {
        logger.error(`Login error: ${error.message}`);
        return res.status(500).json({
            errors: { errorMessage: ["Server error during registration"] }
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
            successMessage: 'Logout successful'
        });
};