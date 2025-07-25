const User = require('../models/User');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const logger = require('../config/logger');

async function getUsers(req, res){
    const userId = req.userId;
    const excludeSelf = req.query.excludeSelf === 'true';
    try {
        let users;
        if (excludeSelf) {
            users = await User.find({ _id: { $ne: userId } })
                .select('_id userName avatar createdAt')
                .lean();
        } else {
            users = await User.find({})
                .select('_id userName avatar createdAt')
                .lean();
        }

        logger.info(`Users retrieved by ${userId} (excludeSelf=${excludeSelf})`);
        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: users
        });
    }
    catch (error) {
        logger.error(`Error retrieving users: ${error.message}`, { userId, stack: error.stack });
        res.status(500).json({
            success: false,
            message: "Server Error",
            errors: [error.message]
        });
    }
};

async function getChats(req, res){
    const userId = req.userId;
    try {
        const user = await User.findById(userId).select('chats').lean();
        if (!user) {
            logger.warn(`getChats failed: User not found (ID: ${userId})`);
            return res.status(404).json({ 
                success: false, 
                message: 'User not found',
                errors: [`No user found with ID ${userId}`]
            });
        }

        const chats = await Chat.find({ _id: { $in: user.chats } })
            .populate('members', '_id userName avatar')
            .populate('lastMessage', 'chatId senderId content type status')
            .lean();
        logger.info(`Chats retrieved for user: ${userId} (${chats.length} chats)`);
        res.status(200).json({
            success: true,
            message: "Chats retrieved successfully",
            data: chats
        });
    }
    catch (error) {
        logger.error(`Error in getChats for user ${userId}: ${error.message}`, { stack: error.stack });
        res.status(500).json({
            success: false,
            message: "Server Error",
            errors: [error.message]
        });
    }
};

async function getChatMessages(req, res){
    const chatId = req.params.id;
    try {
        const messages = await Message.find({ chatId: chatId })
            .select('chatId senderId content type status createdAt')
            .sort({ createdAt: 1 })
            .lean();
        if (!messages) {
            return res.status(404).json({
                success: false,
                message: 'No messages found for this chat',
                errors: [`No messages found for chat ID ${chatId}`]
            });
        }
        res.status(200).json({
            success: true,
            message: 'Messages retrieved successfully',
            data: messages,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            errors: [error.message]
        });
    }
};

async function createChat(req, res){
    let { members } = req.body;
    if (!Array.isArray(members) || members.length < 2) {
        logger.warn(`createChat failed: Invalid members input - ${JSON.stringify(members)}`);
        return res.status(400).json({
            success: false,
            message: 'Invalid input: chat must include at least two members.',
            errors: ['Expected an array with at least two user IDs']
        });
    }
    
    if (!members.includes(req.userId)) {
        logger.warn(`Unauthorized chat access: user ${req.userId} is not a member of this chat`);
        return res.status(403).json({
            success: false,
            message: 'Forbidden: you are not a member of this chat.',
            errors: [`User ${req.userId} is not in [${members.join(', ')}]`]
        });
    }
    try {
        const newChat = await Chat.create({
            members
        });

        await User.updateMany(
            { _id: { $in: members } },
            { $push: { chats: newChat._id } }
        );
        logger.info(`Chat created (ID: ${newChat._id}) with members: ${members.join(', ')}`);

        const newChatObj = newChat.toObject();
        const resData = {
            _id: newChatObj._id,
            members: newChatObj.members,
            lastMessage: newChatObj.lastMessage,
            createdAt: newChatObj.createdAt
        };
        res.status(200).json({
            success: true,
            message: 'Chat created successfully',
            data: resData,
        });
    }
    catch (error) {
        logger.error(`createChat error: ${error.message}`, { stack: error.stack });
        return res.status(500).json({
            success: false,
            message: "Server Error",
            errors: [error.message]
        });
    }
};

async function createMessage(req, res){
    const { chatId, senderId, type, content } = req.body;
    if (req.userId != senderId) {
        logger.warn(`Sender mismatch: req.userId=${req.userId} != senderId=${senderId}`);
        return res.status(403).json({
            success: false,
            message: "Forbidden: sender ID does not match authenticated user",
            errors: [`authenticated user: ${req.userId}, sender: ${senderId}`]
        });
    };

    try {
        if (type === 'image' && !req.file.filename) {
            logger.warn(`Missing image for non-text message from user ${senderId}`);
            return res.status(400).json({
                success: false,
                message: 'Image is required for this message type',
                errors: ['No image file in the request']
            });
        }
        const message = await Message.create({
            chatId: chatId,
            senderId: senderId,
            content: type === 'text' ? content : req.file.filename,
            type: type
        });
        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: message._id,
        });
        logger.info(`Message created in chat ${chatId} by user ${senderId} (type: ${type})`);

        const messageObj = message.toObject();
        const resData = {
            _id: messageObj._id,
            senderId: messageObj.senderId,
            chatId: messageObj.chatId,
            type: messageObj.type,
            content: messageObj.content,
            status: messageObj.status,
            createdAt: messageObj.createdAt
        };
        res.status(200).json({
            success: true,
            message: "Message created successfully",
            data: resData
        });
    }
    catch (error) {
        logger.error(`createMessage error for user ${senderId}: ${error.message}`, { chatId, stack: error.stack });
        return res.status(500).json({
            success: false,
            message: "Server Error",
            errors: [error.message]
        });
    }
};

async function updateMessageStatus(req, res){
    const { status } = req.body;
    const msgId = req.params.id;
    const userId = req.userId;
    try {
        const message = await Message.findById(msgId).lean();
        if (!message) {
            logger.warn(`Message not found: msgId=${msgId}`);
            return res.status(404).json({ 
                success: false, 
                message: 'Message not found',
                errors: [`Message(${msgId}) not found`] 
            });
        }

        const chat = await Chat.findById(message.chatId).select('members').lean();
        if (!chat) {
            logger.warn(`Chat not found for message: msgId=${msgId}, chatId=${message.chatId}`);
            return res.status(404).json({ 
                success: false, 
                message: 'Chat not found',
                errors: [`Chat(${message.chatId}) not found`] 
            });
        }

        if (!chat.members.map(id => id.toString()).includes(req.userId)) {
            logger.warn(`Unauthorized status update: user ${req.userId} not in chat ${chat._id}`);
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You are not a member of this chat.',
                errors: [[`User ${req.userId} is not in [${chat.members.join(', ')}]`]]
            });
        }

        const updated = await Message.findByIdAndUpdate(
            msgId,
            { status },
            { new: true }
        );
        logger.info(`Message ${msgId} status updated to ${status} by ${req.userId}`);

        const messageObj = updated.toObject();
        const resData = {
            _id: messageObj._id,
            senderId: messageObj.senderId,
            chatId: messageObj.chatId,
            type: messageObj.type,
            content: messageObj.content,
            status: messageObj.status,
            createdAt: messageObj.createdAt
        };
        res.status(200).json({
            success: true,
            message: 'Message status updated successfully',
            data: resData
        });
    } catch (error) {
        logger.error(`Error updating message status: ${error.message}`, {
            userId,
            msgId,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: "Server Error",
            errors: [error.message]
        });
    }
};

module.exports = {
    getUsers,
    getChats,
    getChatMessages,
    createChat,
    createMessage,
    updateMessageStatus
};