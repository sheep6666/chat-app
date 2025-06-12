const mongoose = require('mongoose');
const { Schema } = mongoose;

const chatSchema = new Schema({
    members: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }],
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);
