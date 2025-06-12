const User = require('../models/User');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const logger = require('../config/logger');

module.exports.getUsers = async (req, res) => {
    try {
        let users = await User.find()
            .select('_id userName avatar createdAt')
            .lean();

        res.status(200).json({
            success: true,
            data: users
        });
    }
    catch (error) {
        logger.error(`Failed to fetch users: ${error.message}`);
        res.status(500).json({
            error: { errorMessage: 'Server Error' }
        });
    }
};

module.exports.getChats = async (req, res) => {
    try {
        const chats = await Chat.find()
            .populate('members', '_id userName avatar')
            .populate('lastMessage', 'senderId content type status')
            .lean();
        res.status(200).json({
            success: true,
            data: chats
        }); 
    }
    catch (error) {
        logger.error(`Failed to fetch chats: ${error.message}`);
        res.status(500).json({
            error: { errorMessage: 'Server Error' }
        });
    }
};

module.exports.getChatMessages = async (req, res) => {
    const chatId = req.params.id;
    try {
        const messages = await Message.find({ chatId: chatId })
            .select('senderId content type status createdAt')
            .sort({ createdAt: 1 })
            .lean();

        if (!messages) {
            return res.status(404).json({
                success: false,
                error: { message: 'Chat not found' }
            });
        }
        res.status(200).json({
            success: true,
            data: messages
        });
    }
    catch (error) {
        logger.error(`Failed to fetch messages for chat ${req.params.id}: ${error.message}`);
        return res.status(500).json({
            error: { errorMessage: 'Server Error' }
        });
    }
};

module.exports.createChat = async (req, res) => {
    console.log(req.body)
    const { members } = req.body;
    try {
        const newChat = await Chat.create({
            members
        });
        await User.updateMany(
            { _id: { $in: members } },
            { $push: { chats: newChat._id } }
        );
        return res.status(200).json({
            successMessage: "Success",
            data: newChat
        });
    } catch (error) {
        logger.error(`Failed to create chat: ${error.message}`);
        return res.status(500).json({
            errors: { errorMessage: ["Server error"] }
        });
    }
};

module.exports.createMessage = async (req, res) => {
    const { chatId, senderId, type, content } = req.body;
    try {
        const message = await Message.create({
            chatId: chatId,
            senderId: senderId,
            content: content,
            type: type
        });

        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: message._id,
        });

        return res.status(200).json({
            successMessage: "Message created successfully",
            data: message
        });
    } catch (error) {
        logger.error(`Failed to create message: ${error.message}`);
        return res.status(500).json({
            errors: { errorMessage: ["Server error during registration"] }
        });
    }
};

module.exports.updateMessageStatus = async (req, res) => {
    const { status } = req.body;
    const msgId = req.params.id;
    try {
        const message = await Message.findByIdAndUpdate(
            msgId,
            { status },
            { new: true }
        );
        
        res.status(200).json({
            success: true,
            data: message
        });
    } catch (error) {
        logger.error(`Failed to update message status: ${req.params.id} ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Server error while updating message status',
        });
    }
};