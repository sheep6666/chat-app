const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
    chatId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Chat', 
        required: true 
    },
    senderId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    content: {
        type: String, 
        default: ''
    },
    type: {
        type: String,
        enum: ['text', 'image'],
        required: true 
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'seen'],
        default: 'sent'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
