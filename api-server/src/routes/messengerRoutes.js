const express = require('express');
const router = express.Router();

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
router.post("/messages", createMessage);
router.patch("/messages/:id/status", updateMessageStatus);

module.exports = router;
