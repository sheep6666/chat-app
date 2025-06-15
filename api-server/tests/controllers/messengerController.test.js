
jest.mock('../../src/models/User');
jest.mock('../../src/models/Chat');
jest.mock('../../src/models/Message');
jest.mock('../../src/config/logger');
const User = require('../../src/models/User');
const Chat = require('../../src/models/Chat');
const Message = require('../../src/models/Message');
const logger = require('../../src/config/logger');
const {     
    getUsers,
    getChats,
    getChatMessages,
    createChat,
    createMessage,
    updateMessageStatus 
} = require('../../src/controllers/messengerController');

describe('getUsers', () => {
    let req, res;

    beforeEach(() => {
        req = {
            userId: 'user123',
            query: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return users excluding self when excludeSelf=true', async () => {
        req.query.excludeSelf = 'true';
        const mockUsers = [{ _id: 'user456', userName: 'Alice', avatar: 'a.jpg', createdAt: new Date() }];
        User.find.mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(mockUsers)
            })
        });

        await getUsers(req, res);

        expect(User.find).toHaveBeenCalledWith({ _id: { $ne: req.userId } });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Users retrieved successfully",
            data: mockUsers
        });
    });

    it('should return all users when excludeSelf=false', async () => {
        req.query.excludeSelf = 'false';
        const mockUsers = [{ _id: 'user123', userName: 'You', avatar: 'b.jpg', createdAt: new Date() }];
        User.find.mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(mockUsers)
            })
        });

        await getUsers(req, res);

        expect(User.find).toHaveBeenCalledWith({});
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Users retrieved successfully",
            data: mockUsers
        });
    });

    it('should return 500 on error', async () => {
        const error = new Error('DB failure');
        User.find.mockImplementation(() => {
            throw error;
        });

        await getUsers(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Server Error",
            errors: ['DB failure']
        });
    });
});

describe('getChats', () => {
    let req, res;

    beforeEach(() => {
        req = { userId: 'user123' };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 404 if user is not found', async () => {
        User.findById.mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(null)
            })
        });

        await getChats(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'User not found',
            errors: ['No user found with ID user123']
        });
        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('getChats failed: User not found'));
    });

    it('should return 200 with chats when user is found', async () => {
        const mockChats = [
            { _id: 'chat1', members: [], lastMessage: {} }
        ];

        User.findById.mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({ chats: ['chat1'] })
            })
        });

        Chat.find.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(mockChats)
        });

        await getChats(req, res);

        expect(Chat.find).toHaveBeenCalledWith({ _id: { $in: ['chat1'] } });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Chats retrieved successfully',
            data: mockChats
        });
        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Chats retrieved for user: user123'));
    });

    it('should return 500 on error', async () => {
        const error = new Error('DB error');
        User.findById.mockImplementation(() => { throw error; });

        await getChats(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Server Error',
            errors: ['DB error']
        });
        expect(logger.error).toHaveBeenCalledWith(
            expect.stringContaining('Error in getChats for user user123: DB error'),
            expect.objectContaining({ stack: expect.any(String) })
        );
    });
});

describe('getChatMessages', () => {
    let req, res;

    beforeEach(() => {
        req = { params: { id: 'chat123' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 with messages if found', async () => {
        const mockMessages = [
            {
                chatId: 'chat123',
                senderId: 'user123',
                content: 'Hello',
                type: 'text',
                status: 'sent',
                createdAt: new Date()
            }
        ];

        Message.find.mockReturnValue({
            select: jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockMessages)
                })
            })
        });

        await getChatMessages(req, res);

        expect(Message.find).toHaveBeenCalledWith({ chatId: 'chat123' });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Messages retrieved successfully',
            data: mockMessages
        });
    });

    it('should return 404 if no messages are found', async () => {
        Message.find.mockReturnValue({
            select: jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(null)
                })
            })
        });

        await getChatMessages(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'No messages found for this chat',
            errors: ['No messages found for chat ID chat123']
        });
    });

    it('should return 500 if an error occurs', async () => {
        const error = new Error('DB failure');
        Message.find.mockImplementation(() => { throw error; });

        await getChatMessages(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Server Error',
            errors: ['DB failure']
        });
    });
});

describe('createChat', () => {
    let req, res;

    beforeEach(() => {
        req = {
            userId: 'user123',
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if members is not an array or less than two', async () => {
        req.body.members = ['user123'];
        await createChat(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Invalid input: chat must include at least two members.'
        }));
    });

    it('should return 403 if user is not in the chat members', async () => {
        req.body.members = ['user456', 'user789'];
        await createChat(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Forbidden: you are not a member of this chat.'
        }));
    });

    it('should create chat and return 200 if input is valid', async () => {
        const mockChat = {
            _id: 'chat123',
            members: ['user123', 'user456'],
            lastMessage: null,
            createdAt: new Date(),
            toObject: function () {
                return this;
            }
        };

        req.body.members = ['user123', 'user456'];
        Chat.create.mockResolvedValue(mockChat);
        User.updateMany.mockResolvedValue({});

        await createChat(req, res);

        expect(Chat.create).toHaveBeenCalledWith({ members: ['user123', 'user456'] });
        expect(User.updateMany).toHaveBeenCalledWith(
            { _id: { $in: ['user123', 'user456'] } },
            { $push: { chats: mockChat._id } }
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Chat created successfully',
            data: {
                _id: mockChat._id,
                members: mockChat.members,
                lastMessage: mockChat.lastMessage,
                createdAt: mockChat.createdAt
            }
        }));
    });

    it('should return 500 if an error occurs', async () => {
        req.body.members = ['user123', 'user456'];
        const error = new Error('DB error');
        Chat.create.mockRejectedValue(error);

        await createChat(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Server Error',
            errors: ['DB error']
        });
        expect(logger.error).toHaveBeenCalledWith(
            expect.stringContaining('createChat error: DB error'),
            expect.objectContaining({ stack: expect.any(String) })
        );
    });
});

describe('createMessage', () => {
    let req, res;

    beforeEach(() => {
        req = {
            userId: 'user123',
            body: {
                chatId: 'chat123',
                senderId: 'user123',
                type: 'text',
                content: 'Hello'
            },
            file: { filename: 'img.jpg' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 403 if senderId does not match authenticated user', async () => {
        req.userId = 'user999';
        await createMessage(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Forbidden: sender ID does not match authenticated user'
        }));
    });

    it('should return 400 if type is image and no image file', async () => {
        req.body.type = 'image';
        req.file = {};
        await createMessage(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Image is required for this message type'
        }));
    });

    it('should create message and return 200', async () => {
        const mockMessage = {
            _id: 'msg123',
            chatId: 'chat123',
            senderId: 'user123',
            type: 'text',
            content: 'Hello',
            status: 'sent',
            createdAt: new Date(),
            toObject: function () { return this; }
        };

        Message.create.mockResolvedValue(mockMessage);
        Chat.findByIdAndUpdate.mockResolvedValue({});

        await createMessage(req, res);

        expect(Message.create).toHaveBeenCalledWith({
            chatId: 'chat123',
            senderId: 'user123',
            content: 'Hello',
            type: 'text'
        });
        expect(Chat.findByIdAndUpdate).toHaveBeenCalledWith('chat123', {
            lastMessage: mockMessage._id
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Message created successfully',
            data: expect.objectContaining({
                _id: mockMessage._id,
                content: 'Hello'
            })
        }));
    });

    it('should return 500 if an error occurs', async () => {
        const error = new Error('DB failure');
        Message.create.mockRejectedValue(error);

        await createMessage(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Server Error',
            errors: ['DB failure']
        });
        expect(logger.error).toHaveBeenCalledWith(
            expect.stringContaining('createMessage error for user user123: DB failure'),
            expect.objectContaining({ chatId: 'chat123', stack: expect.any(String) })
        );
    });
});

describe('updateMessageStatus', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { id: 'msg123' },
            body: { status: 'read' },
            userId: 'user123'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 404 if message not found', async () => {
        Message.findById.mockReturnValue({
            lean: jest.fn().mockResolvedValue(null)
        });
        await updateMessageStatus(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Message not found'
        }));
    });

    it('should return 404 if chat not found', async () => {
        Message.findById.mockReturnValue({
            lean: jest.fn().mockResolvedValue({ chatId: 'chat999' })
        });
        Chat.findById.mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(null)
            })
        });
        await updateMessageStatus(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Chat not found',
            errors: [`Chat(chat999) not found`]
        }));
    });

    it('should return 403 if user is not a member of the chat', async () => {
        Message.findById.mockReturnValue({
            lean: jest.fn().mockResolvedValue({ chatId: 'chat123' })
        });
        Chat.findById.mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({ _id: 'chat123', members: ['user999'] })
            })
        });
        await updateMessageStatus(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Forbidden: You are not a member of this chat.'
        }));
    });

    it('should update message and return 200', async () => {
        const updatedMessage = {
            _id: 'msg123',
            senderId: 'user456',
            chatId: 'chat123',
            type: 'text',
            content: 'Hello',
            status: 'read',
            createdAt: new Date(),
            toObject: function () { return this; }
        };

        Message.findById.mockReturnValue({
            lean: jest.fn().mockResolvedValue({ chatId: 'chat123' })
        });
        Chat.findById.mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({ _id: 'chat123', members: ['user123'] })
            })
        });
        Message.findByIdAndUpdate.mockResolvedValue(updatedMessage);

        await updateMessageStatus(req, res);

        expect(Message.findByIdAndUpdate).toHaveBeenCalledWith('msg123', { status: 'read' }, { new: true });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Message status updated successfully',
            data: expect.objectContaining({ _id: 'msg123', status: 'read' })
        }));
    });

    it('should return 500 if an error occurs', async () => {
        const error = new Error('DB error');
        Message.findById.mockImplementation(() => { throw error; });

        await updateMessageStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Server Error',
            errors: ['DB error']
        });
    });
});