const mongoose = require('mongoose');

// Connect to MongoDB
const databaseConnect = () => {
    mongoose.connect(process.env.DATABASE_URL)
    .then(() => {
        console.log('MongoDB connected');
    }).catch((err) => {
        console.log(`MongoDB connection error: ${err.message}`);
        process.exit(1); // 強制終止（避免 app 無資料庫還繼續跑）
    })
};

module.exports = databaseConnect;