require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Redis = require('ioredis');
const logger = require('./config/logger');

const redis = new Redis(process.env.REDIS_URL);

const PORT = process.env.PORT || 8000;
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
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];
  
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  path: '/ws/socket.io',
  cors: {
    origin: allowedOrigins.length > 0 ? allowedOrigins : false,
    methods: ['GET', 'POST']
  }
});

// User Management
const getActiveUsers = async () => {
  const keys = await redis.keys('user:*');
  const users = [];
  for (const key of keys) {
    const data = await redis.hgetall(key);
    if (Object.keys(data).length > 0) {
      users.push(data);
    }
  }
  return users;
};

const addUser = async (userId, socketId, userName) => {
  const key = `user:${userId}`;
  await redis.hmset(key, { userName, userId, socketId });
  await redis.expire(key, 300); // 自動過期，防止殘留
  logger.info(`Add user to Redis: ${key}`);
};

const removeUser = async (userId) => {
  const key = `user:${userId}`;
  await redis.del(key);
  logger.info(`Remove user from Redis: ${key}`);
};

const getUser = async (userId) => {
  return await redis.hgetall(`user:${userId}`);
};

// WebSocket event handlers
io.on(EVENT.CLIENT_USER_JOINED, async (socket) => {
    const socketId = socket.id;
    const userId = socket.handshake.auth.userId;
    const userName = socket.handshake.auth.userName;
    const avatar = socket.handshake.auth.avatar;
    const createdAt = socket.handshake.auth.createdAt;
    logger.info(`Receive CLIENT_USER_JOINED from ${userName}`);

    await addUser(userId, socketId, userName);
    try {
      const users = await getActiveUsers();
      socket.emit(EVENT.SERVER_ACTIVE_USERS, users);
    } catch (err) {
      logger.error(`Failed to get active users: ${err}`);
      socket.emit(EVENT.SERVER_ACTIVE_USERS, []);
    }
    socket.broadcast.emit(EVENT.SERVER_USER_JOINED, { userId, userName, avatar, createdAt });

    socket.on(EVENT.CLIENT_USER_TYPING, async (data) => {
        const { senderId, receiverIds, chatId } = data;
        const sender = await getUser(senderId);
        logger.info(`Receive CLIENT_USER_TYPING from ${sender.userName}`);

        for (const uid of receiverIds) {
            const receiver = await getUser(uid);
            if(receiver?.socketId){
                socket.to(receiver.socketId).emit(EVENT.SERVER_USER_TYPING, data);
            }
        };
    });

    socket.on(EVENT.CLIENT_MESSAGE_SENT, async (data) => {
        const { senderId, receiverIds, message } = data;
        const sender = await getUser(senderId);
        logger.info(`Receive CLIENT_MESSAGE_SENT from ${sender.userName}`);

        for (const uid of receiverIds) {
            const receiver = await getUser(uid);
            if(receiver?.socketId){
                socket.to(receiver.socketId).emit(EVENT.SERVER_MESSAGE_SENT, data);
            }
        };
    });

    socket.on(EVENT.CLIENT_MESSAGE_UPDATED, async (data) => {
        const { senderId, receiverIds, message } = data;
        const sender = await getUser(senderId);
        logger.info(`Receive CLIENT_MESSAGE_UPDATED from ${sender.userName}`);

        for (const uid of receiverIds) {
            const receiver = await getUser(uid);
            if(receiver?.socketId){
                socket.to(receiver.socketId).emit(EVENT.SERVER_MESSAGE_UPDATED, data);
            }
        };
    });

    socket.on(EVENT.CLIENT_USER_LEFT, () => {
        logger.info(`Receive CLIENT_USER_LEFT from ${userName}`);
        removeUser(userId)
        socket.broadcast.emit(EVENT.SERVER_USER_LEFT, { senderId: userId });
    });
});


let serverStarted = false;
redis.on('ready', () => {
  logger.info('Redis is ready.');

  if (!serverStarted) {
    server.listen(PORT, '0.0.0.0', () => {
        serverStarted = true;
        logger.info(`Socket.IO server is running on port ${PORT}`);
    });
    }
});

redis.on('error', (err) => {
  logger.error(`Redis connection error: ${err}`);
});

redis.on('reconnecting', () => {
  logger.warn('Redis reconnecting...');
});