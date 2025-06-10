// Load environment variables from config file
require('dotenv').config({ path: './config/config.env' });
const express = require('express');

// Route modules
const authRoutes = require('./routes/authRoutes');
const messengerRoutes = require('./routes/messengerRoutes');

const PORT = 5001;
const app = express();

// API route registrations
app.use('/api/auth', authRoutes);
app.use('/api/messenger', messengerRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
