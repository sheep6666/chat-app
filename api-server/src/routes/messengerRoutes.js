const express = require('express');
const router = express.Router();

const { uploadMessageImage } = require('../middlewares/uploadMiddleware');

const {
    getUsers, 
    getChats, 
    getChatMessages, 
    createChat, 
    createMessage, 
    updateMessageStatus
} = require("../controllers/messengerController");

router.get("/users", getUsers);
router.get("/chats", getChats);
router.get("/chats/:id/messages", getChatMessages);
router.post("/chats", createChat);
router.post("/messages", uploadMessageImage.single('image'), createMessage);
router.patch("/messages/:id/status", updateMessageStatus);

module.exports = router;
