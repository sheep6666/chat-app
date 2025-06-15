jest.mock('bcrypt');
jest.mock('../../src/models/User');
jest.mock('../../src/config/logger');
jest.mock('../../src/controllers/utils');
const bcrypt = require('bcrypt');
const User = require('../../src/models/User');
const logger = require('../../src/config/logger');
const auth = require('../../src/controllers/authController');
const utils = require("../../src/controllers/utils");

describe('registerUser', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                userName: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123'
            },
            file: { filename: 'avatar.png' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            cookie: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        process.env.JWT_SECRET = 'testsecret';
        process.env.TOKEN_EXP = '1h';
        process.env.COOKIE_EXP = '1';
        process.env.NODE_ENV = 'test';
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should return 400 if validation fails', async () => {
        utils.validateRegistrationFields.mockReturnValue(['User name is required']);
        await auth.registerUser(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Validation failed',
            errors: ['User name is required']
        }));
    });

    it('should return 400 if user already exists', async () => {
        utils.validateRegistrationFields.mockReturnValue([]);
        User.findOne.mockResolvedValue({ email: 'test@example.com' });
        await auth.registerUser(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'User already exists'
        }));
    });

    it('should register user and return token', async () => {
        utils.validateRegistrationFields.mockReturnValue([]);
        User.findOne.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue('hashedPassword');
        User.create.mockResolvedValue({ ...req.body, _id: '12345' });
        utils.createAuthToken.mockReturnValue('mockToken');

        await auth.registerUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.cookie).toHaveBeenCalledWith('authToken', 'mockToken', expect.any(Object));
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'User created successfully',
            data: { token: 'mockToken' }
        }));
    });
});

describe('logoutUser', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            cookie: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it('should log out user and clear authToken cookie (with userId)', () => {
        req.userId = '12345';
        auth.logoutUser(req, res);
        expect(logger.info).toHaveBeenCalledWith('User logged out: 12345');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.cookie).toHaveBeenCalledWith('authToken', '', expect.objectContaining({
            httpOnly: true,
            secure: expect.any(Boolean),
            sameSite: 'lax',
            expires: expect.any(Date)
        }));
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Logout successful"
        });
    });

    it('should log message when no userId is provided', () => {
        auth.logoutUser(req, res);

        expect(logger.info).toHaveBeenCalledWith('User logout attempted (no userId available)');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.cookie).toHaveBeenCalledWith('authToken', '', expect.any(Object));
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Logout successful"
        });
    });
});

describe('loginUser', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                email: 'test@example.com',
                password: 'password123'
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            cookie: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        process.env.JWT_SECRET = 'testsecret';
        process.env.TOKEN_EXP = '1h';
        process.env.COOKIE_EXP = '1';
        process.env.NODE_ENV = 'test';
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should return 400 if validation fails', async () => {
        utils.validateLoginFields.mockReturnValue(['Email is required']);
        await auth.loginUser(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Validation failed'
        }));
    });

    it('should return 400 if user is not found', async () => {
        utils.validateLoginFields.mockReturnValue([]);
        User.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(null),
        });
        await auth.loginUser(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Login failed',
            errors: ['Email not found']
        }));
    });

    it('should return 400 if password is invalid', async () => {
        utils.validateLoginFields.mockReturnValue([]);
        User.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue({ email: 'test@example.com', password: 'hashedPassword' }),
        });
        bcrypt.compare.mockResolvedValue(false);
        await auth.loginUser(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Login failed',
            errors: ['Invalid password']
        }));
    });

    it('should login user and return token', async () => {
        utils.validateLoginFields.mockReturnValue([]);
        User.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue({ email: 'test@example.com', password: 'hashedPassword' }),
        });
        bcrypt.compare.mockResolvedValue(true);
        utils.createAuthToken.mockReturnValue('mockToken');

        await auth.loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.cookie).toHaveBeenCalledWith('authToken', 'mockToken', expect.any(Object));
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Login successful',
            data: { token: 'mockToken' }
        }));
    });
});