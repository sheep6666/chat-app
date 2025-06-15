
jest.mock('jsonwebtoken');
jest.mock('../../src/config/logger');

const jwt = require('jsonwebtoken');
const logger = require('../../src/config/logger');
const {
  authenticateUser,
  authenticateUserOptional,
  extractUserFromToken,
  verifyJwtToken
} = require('../../src/middlewares/authMiddleware');

describe('authMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { cookies: { authToken: 'valid.token.here' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    process.env.JWT_SECRET = 'testsecret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyJwtToken', () => {
    it('should resolve decoded token', async () => {
      const decoded = { _id: 'user123' };
      jwt.verify.mockImplementation((token, secret, cb) => cb(null, decoded));
      await expect(verifyJwtToken('token')).resolves.toEqual(decoded);
    });

    it('should reject if token is invalid', async () => {
      jwt.verify.mockImplementation((token, secret, cb) => cb(new Error('invalid')));
      await expect(verifyJwtToken('badtoken')).rejects.toThrow('invalid');
    });
  });

  describe('extractUserFromToken', () => {
    it('should throw if token is missing', async () => {
      await expect(extractUserFromToken({ cookies: {} }))
        .rejects.toThrow('Missing token');
    });

    it('should return decoded token if valid', async () => {
      const decoded = { _id: 'user123' };
      jwt.verify.mockImplementation((token, secret, cb) => cb(null, decoded));
      const result = await extractUserFromToken(req);
      expect(result).toEqual(decoded);
    });
  });

  describe('authenticateUser', () => {
    it('should call next and attach userId if valid token', async () => {
      jwt.verify.mockImplementation((token, secret, cb) => cb(null, { _id: 'user123' }));
      await authenticateUser(req, res, next);
      expect(req.userId).toBe('user123');
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      jwt.verify.mockImplementation((token, secret, cb) => cb(new Error('bad token')));
      await authenticateUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: { message: 'Invalid or missing authentication token.' }
      });
    });
  });

  describe('authenticateUserOptional', () => {
    it('should attach userId if valid token', async () => {
      jwt.verify.mockImplementation((token, secret, cb) => cb(null, { _id: 'user123' }));
      await authenticateUserOptional(req, res, next);
      expect(req.userId).toBe('user123');
      expect(next).toHaveBeenCalled();
    });

    it('should skip user assignment if no token', async () => {
      req.cookies = {};
      await authenticateUserOptional(req, res, next);
      expect(req.userId).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it('should skip user assignment if token invalid', async () => {
      jwt.verify.mockImplementation((token, secret, cb) => cb(new Error('invalid')));
      await authenticateUserOptional(req, res, next);
      expect(req.userId).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });
});
