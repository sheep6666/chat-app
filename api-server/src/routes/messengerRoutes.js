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


/**
 * @swagger
 * /api/messenger/users:
 *   get:
 *     summary: Get list of users (friends)
 *     description: Retrieve a list of users. You can optionally exclude the current user from the list using the `excludeSelf` query parameter.
 *     tags: [Messenger]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: excludeSelf
 *         schema:
 *           type: boolean
 *         description: If true, exclude the current user from the list.
 *     responses:
 *       200:
 *         description: A list of user objects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: User ID
 *                       userName:
 *                         type: string
 *                       avatar:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized (missing or invalid JWT)
 *       500:
 *         description: Server error
 */
router.get("/users", authenticateUser, getUsers);  

/**
 * @swagger
 * /api/messenger/chats:
 *   get:
 *     summary: Get all chats for the current user
 *     description: Retrieve a list of all chat sessions the authenticated user participates in, including member and last message info.
 *     tags: [Messenger]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of chat sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Chat ID
 *                       members:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             userName:
 *                               type: string
 *                             avatar:
 *                               type: string
 *                       lastMessage:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           _id:
 *                             type: string
 *                           senderId:
 *                             type: string
 *                           content:
 *                             type: string
 *                           type:
 *                             type: string
 *                             description: Message type (e.g. "text", "image")
 *                           status:
 *                             type: string
 *                             description: Message status (e.g. "sent", "read")
 *       401:
 *         description: Unauthorized (missing or invalid JWT)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/chats", authenticateUser, getChats);    

/**
 * @swagger
 * /api/messenger/chats/{id}/messages:
 *   get:
 *     summary: Get all messages from a chat
 *     description: Retrieve all messages belonging to a specific chat, sorted by creation time (oldest first).
 *     tags: [Messenger]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: A list of messages from the chat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string   
 *                       senderId:
 *                         type: string
 *                       content:
 *                         type: string
 *                       type:
 *                         type: string
 *                         description: Message type (e.g. "text", "image")
 *                       status:
 *                         type: string
 *                         description: Message status (e.g. "sent", "read")
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized (missing or invalid JWT)
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Server error
 */
router.get("/chats/:id/messages", authenticateUser, getChatMessages);  

/**
 * @swagger
 * /api/messenger/chats:
 *   post:
 *     summary: Create a new chat
 *     description: Create a new chat session with the specified members. The authenticated user must be included in the member list.
 *     tags: [Messenger]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - members
 *             properties:
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of user IDs (at least 2, including yourself)
 *     responses:
 *       200:
 *         description: Chat created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     members:
 *                       type: array
 *                       items:
 *                         type: string
 *                     lastMessage:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input (e.g., less than 2 members)
 *       403:
 *         description: User is not included in members list
 *       500:
 *         description: Server error
 */
router.post("/chats", authenticateUser, createChat);

/**
 * @swagger
 * /api/messenger/messages:
 *   post:
 *     summary: Create a new message
 *     description: Create a message in a specific chat. Accepts either text content or an uploaded image file, depending on the message type.
 *     tags: [Messenger]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatId
 *               - senderId
 *               - type
 *               - content
 *             properties:
 *               chatId:
 *                 type: string
 *               senderId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [text, image]
 *               content:
 *                 type: string
 *                 description: Text content (required if type is "text")
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - chatId
 *               - senderId
 *               - type
 *               - content
 *             properties:
 *               chatId:
 *                 type: string
 *               senderId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [text, image]
 *               content:
 *                 type: string
 *                 format: binary
 *                 description: File upload (required if type is "image")
 *     responses:
 *       200:
 *         description: Message created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     chatId:
 *                       type: string
 *                     senderId:
 *                       type: string
 *                     content:
 *                       type: string
 *                     type:
 *                       type: string
 *                     status:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Missing content or image for message
 *       403:
 *         description: Authenticated user does not match senderId
 *       500:
 *         description: Server error
 */
router.post("/messages", authenticateUser, uploadMessageImage.single('image'), createMessage);

/**
 * @swagger
 * /api/messenger/messages/{id}/status:
 *   patch:
 *     summary: Update message status
 *     description: Update the status of a specific message (e.g., sent, delivered, read). The user must be a member of the associated chat.
 *     tags: [Messenger]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Message ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 example: read
 *                 description: New status of the message
 *     responses:
 *       200:
 *         description: Message status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     chatId:
 *                       type: string
 *                     senderId:
 *                       type: string
 *                     content:
 *                       type: string
 *                     type:
 *                       type: string
 *                     status:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       403:
 *         description: User is not a member of the chat
 *       404:
 *         description: Message or chat not found
 *       500:
 *         description: Server error
 */
router.patch("/messages/:id/status", authenticateUser, updateMessageStatus);   

module.exports = router;
