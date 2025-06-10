require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const PORT = 8000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    }
});

io.on("connection", async (socket) => {
    console.log(`Client connected, socket.id:`, socket.id);
    socket.on('disconnect', () => {
        console.log(`Client disconnected, socket.id:`, socket.id);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Socket.IO server is running on port ${PORT}`);
});