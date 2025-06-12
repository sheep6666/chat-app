const express = require('express');
const router = express.Router();

const { authenticateUserOptional } = require('../middlewares/authMiddleware');
const { uploadAvatar } = require('../middlewares/uploadMiddleware');

const { 
    registerUser, 
    loginUser, 
    logoutUser 
} = require("../controllers/authController");

router.post("/users", uploadAvatar.single('avatar'), registerUser);
router.post("/login", loginUser);
router.post("/logout", authenticateUserOptional, logoutUser);

module.exports = router;