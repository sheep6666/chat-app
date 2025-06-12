// Load environment variables from config file
require('dotenv').config({ path: './.env' });
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
// Custom modules
const databaseConnect = require('./config/database');
const logger = require('./config/logger');
// Route modules
const authRoutes = require('./routes/authRoutes');
const messengerRoutes = require('./routes/messengerRoutes');

const PORT = 5001;
const app = express();

// CORS setup - allows front-end origin and credentials
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Middlewares
app.use(morgan(':method :url :status :response-time ms', { 
  stream: logger.stream,
  skip: (req, res) => res.statusCode < 100
}));
app.use(cookieParser());
app.use(express.json());

// API route registrations
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/messenger', messengerRoutes);

// Static file serving (e.g. uploaded images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to MongoDB database
databaseConnect();

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Swagger docs at http://localhost:${PORT}/api-docs`);
});
