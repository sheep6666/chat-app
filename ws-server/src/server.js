require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const logger = require('./config/logger');

const PORT = 8000;
const EVENT = {
  SERVER_ACTIVE_USERS: "server:active_users",
  CLIENT_USER_JOINED: "connection",
  SERVER_USER_JOINED: "server:user_joined",
  CLIENT_USER_LEFT: "disconnect",
  SERVER_USER_LEFT: "server:user_left",
  CLIENT_USER_TYPING: "client:user_typing",
  SERVER_USER_TYPING: "server:user_typing",
  CLIENT_MESSAGE_SENT: "client:message_sent",
  SERVER_MESSAGE_SENT: "server:message_sent",
  CLIENT_MESSAGE_UPDATED: "client:message_updated",
  SERVER_MESSAGE_UPDATED: "server:message_updated",
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    }
});

// User Management
activeUsersMap = {}
const addUser =  async (userId, socketId, userName) => {
    if (userId in activeUsersMap) return;
    activeUsersMap[userId] = { userId, socketId, userName };
}
const removeUser = async (userId) => {
    delete activeUsersMap[userId];
};

io.on(EVENT.CLIENT_USER_JOINED, async (socket) => {
    const socketId = socket.id;
    const userId = socket.handshake.auth.userId;
    const userName = socket.handshake.auth.userName;
    logger.info(`Receive CLIENT_USER_JOINED from ${userId}`);

    await addUser(userId, socketId, userName);
    socket.emit(EVENT.SERVER_ACTIVE_USERS, Object.values(activeUsersMap));
    socket.broadcast.emit(EVENT.SERVER_USER_JOINED, { senderId: userId });

    socket.on(EVENT.CLIENT_USER_TYPING, (data) => {
        const { senderId, receiverIds, chatId } = data;
        logger.info(`Receive CLIENT_USER_TYPING from ${senderId}`);
        receiverIds.forEach(ruid => {
            const receiver = activeUsersMap[ruid]
            if(receiver){
                socket.to(receiver.socketId).emit(EVENT.SERVER_USER_TYPING, data);
            }
        });
    });

    socket.on(EVENT.CLIENT_MESSAGE_SENT, (data) => {
        const { senderId, receiverIds, message } = data;
        logger.info(`Receive CLIENT_MESSAGE_SENT from ${senderId}`);
        receiverIds.forEach(ruid => {
            const receiver = activeUsersMap[ruid]
            if(receiver){
                socket.to(receiver.socketId).emit(EVENT.SERVER_MESSAGE_SENT, data);
            }
        });
    });

    socket.on(EVENT.CLIENT_MESSAGE_UPDATED, (data) => {
        const { senderId, receiverIds, message } = data;
        logger.info(`Receive CLIENT_MESSAGE_UPDATED from ${senderId}`);
        receiverIds.forEach(ruid => {
            const receiver = activeUsersMap[ruid]
            if(receiver){
                socket.to(receiver.socketId).emit(EVENT.SERVER_MESSAGE_UPDATED, data);
            }
        });
    });

    socket.on(EVENT.CLIENT_USER_LEFT, () => {
        logger.info(`Receive CLIENT_USER_LEFT from ${userId}`);
        removeUser(userId)
        socket.broadcast.emit(EVENT.SERVER_USER_LEFT, { senderId: userId });
    });
});

server.listen(PORT, '0.0.0.0', () => {
    logger.info(`Socket.IO server is running on port ${PORT}`);
});