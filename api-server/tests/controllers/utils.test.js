
const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken');
const {
    validateRegistrationFields,
    validateLoginFields,
    createAuthToken
} = require('../../src/controllers/utils');


describe('validateRegistrationFields', () => {
    it('should return errors when required fields are missing', () => {
        const fields = { userName: '', email: '', password: '', confirmPassword: '' };
        const file = null;
        const errors = validateRegistrationFields(fields, file);
        expect(errors).toContain('User name is required');
        expect(errors).toContain('Email is required');
        expect(errors).toContain('Password is required');
        expect(errors).toContain('Confirm password is required');
        expect(errors).toContain('Image is required');
    });

    it('should return error for invalid email format', () => {
        const fields = {
            userName: 'test',
            email: 'invalid-email',
            password: '123456',
            confirmPassword: '123456'
        };
        const file = {};
        const errors = validateRegistrationFields(fields, file);
        expect(errors).toContain('Email is not valid');
    });

    it('should return error for short password', () => {
        const fields = {
            userName: 'test',
            email: 'test@example.com',
            password: '123',
            confirmPassword: '123'
        };
        const file = {};
        const errors = validateRegistrationFields(fields, file);
        expect(errors).toContain('Password must be at least 6 characters');
    });

    it('should return error if passwords do not match', () => {
        const fields = {
            userName: 'test',
            email: 'test@example.com',
            password: '123456',
            confirmPassword: '654321'
        };
        const file = {};
        const errors = validateRegistrationFields(fields, file);
        expect(errors).toContain('Password and confirm password do not match');
    });

    it('should return empty array if all fields are valid', () => {
        const fields = {
            userName: 'test',
            email: 'test@example.com',
            password: '123456',
            confirmPassword: '123456'
        };
        const file = { originalname: 'avatar.png' };
        const errors = validateRegistrationFields(fields, file);
        expect(errors).toEqual([]);
    });
});

describe('validateLoginFields', () => {
    it('should return errors for missing email and password', () => {
        const errors = validateLoginFields({ email: '', password: '' });
        expect(errors).toContain('Please provide your Email');
        expect(errors).toContain('Please provide your Password');
    });

    it('should return error for invalid email format', () => {
        const errors = validateLoginFields({ email: 'invalid', password: 'password' });
        expect(errors).toContain('Please provide a valid Email');
    });

    it('should return empty array for valid fields', () => {
        const errors = validateLoginFields({ email: 'test@example.com', password: 'password' });
        expect(errors).toEqual([]);
    });
});

describe('createAuthToken', () => {
    const mockUser = {
        _id: 'user123',
        userName: 'testuser',
        email: 'test@example.com',
        avatar: 'avatar.png',
        createdAt: new Date('2024-01-01T00:00:00.000Z')
    };

    beforeAll(() => {
        process.env.JWT_SECRET = 'testsecret';
        process.env.TOKEN_EXP = '1h';
    });

    it('should generate a token with correct payload and options', () => {
        jwt.sign.mockReturnValue('mockToken');

        const token = createAuthToken(mockUser);

        expect(jwt.sign).toHaveBeenCalledWith(
            {
                _id: mockUser._id,
                userName: mockUser.userName,
                email: mockUser.email,
                avatar: mockUser.avatar,
                createdAt: mockUser.createdAt
            },
            'testsecret',
            { expiresIn: '1h' }
        );
        expect(token).toBe('mockToken');
    });

    it('should set createdAt to current date if not provided', () => {
        const userWithoutCreatedAt = {
            ...mockUser,
            createdAt: undefined
        };

        jwt.sign.mockReturnValue('mockToken');

        const token = createAuthToken(userWithoutCreatedAt);

        const payload = jwt.sign.mock.calls[0][0];
        expect(payload.createdAt).toBeInstanceOf(Date);
        expect(token).toBe('mockToken');
    });
});