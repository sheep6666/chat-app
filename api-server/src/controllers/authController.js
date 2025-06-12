const User = require('../models/User');
const logger = require('../config/logger');

module.exports.registerUser = async (req, res) => {
    try {
        const { userName, email, password } = req.body;
        const avatar = `default.jpg`;

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            userName,
            email,
            password: hashedPassword,
            avatar: avatar
        });

        return res.status(200).json({
            successMessage: "User created successfully",
            data: newUser
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
        return res.json({
            successMessage: "Login successful",
            user
        });
    } catch (error) {
        logger.error(`Login error: ${error.message}`);
        return res.status(500).json({
            errors: { errorMessage: ["Server error during registration"] }
        });
    }
};

module.exports.logoutUser = (req, res) => {
    res.send("<h1>logoutUser</h1>");
};