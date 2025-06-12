const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../config/logger');

const createStorageEngine = (subfolder) => {
  const uploadDir = path.join(__dirname, '../..', 'uploads', subfolder);

  // Ensure the upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    logger.info(`Created upload directory: ${uploadDir}`);
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      logger.debug(`Saving file to ${uploadDir}`);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      logger.debug(`Generated filename: ${uniqueName}`);
      cb(null, uniqueName);
    }
  });
};


const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    logger.warn(`Rejected upload: Not an image (type=${file.mimetype})`);
    return cb(null, false);
  }
};

// Avatar image upload middleware (max: 2MB)
const uploadAvatar = multer({
  storage: createStorageEngine('avatars'),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: imageFileFilter
});

// Chat message image upload middleware (max: 5MB)
const uploadMessageImage = multer({
  storage: createStorageEngine('images'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFileFilter
});

module.exports = {
  uploadAvatar,
  uploadMessageImage
};