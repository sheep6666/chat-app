const express = require('express');
const router = express.Router();

const { authenticateUser } = require('../middlewares/authMiddleware');
const { uploadMessageImage } = require('../middlewares/uploadMiddleware');

const {
    getUsers, 
    getChats, 
    getChatMessages, 
    createChat, 
    createMessage, 
    updateMessageStatus
} = require("../controllers/messengerController");

router.get("/users", authenticateUser, getUsers);
router.get("/chats", authenticateUser, getChats);
router.get("/chats/:id/messages", authenticateUser, getChatMessages);
router.post("/chats", authenticateUser, createChat);
router.post("/messages", authenticateUser, uploadMessageImage.single('image'), createMessage);
router.patch("/messages/:id/status", authenticateUser, updateMessageStatus);

module.exports = router;
