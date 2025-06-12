// Load environment variables from config file
require('dotenv').config({ path: './.env' });
const express = require('express');
const databaseConnect = require('./config/database');

// Route modules
const authRoutes = require('./routes/authRoutes');
const messengerRoutes = require('./routes/messengerRoutes');

const PORT = 5001;
const app = express();

// Middlewares
app.use(express.json());

// API route registrations
app.use('/api/auth', authRoutes);
app.use('/api/messenger', messengerRoutes);

// Connect to MongoDB database
databaseConnect();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
