const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    userName: { 
        type: String, 
        required: true 
    },
    password: { 
        type: String, 
        required: true,
        select: false 
    },
    avatar: { 
        type: String,
        required: true, 
    },
    chats: [{
        type: Schema.Types.ObjectId, 
        ref: 'Chat',
        default: [] 
    }],
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
