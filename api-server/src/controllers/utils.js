const jwt = require('jsonwebtoken');
const validator = require('validator');

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

module.exports = {
    validateRegistrationFields,
    validateLoginFields,
    createAuthToken
}