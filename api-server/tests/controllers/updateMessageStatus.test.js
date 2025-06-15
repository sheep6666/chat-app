
const { updateMessageStatus } = require('../../src/controllers/messengerController');
const Message = require('../../src/models/Message');
const Chat = require('../../src/models/Chat');
const logger = require('../../src/config/logger');

jest.mock('../../src/models/Message');
jest.mock('../../src/models/Chat');
jest.mock('../../src/config/logger');

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
        Message.findById.mockResolvedValue(null);
        await updateMessageStatus(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Message not found'
        }));
    });

    it('should return 404 if chat not found', async () => {
        Message.findById.mockResolvedValue({ chatId: 'chat999' });
        Chat.findById.mockResolvedValue(null);
        await updateMessageStatus(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Chat not found'
        }));
    });

    it('should return 403 if user is not a member of the chat', async () => {
        Message.findById.mockResolvedValue({ chatId: 'chat123' });
        Chat.findById.mockResolvedValue({ _id: 'chat123', members: ['user999'] });
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

        Message.findById.mockResolvedValue({ chatId: 'chat123' });
        Chat.findById.mockResolvedValue({ _id: 'chat123', members: ['user123'] });
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
