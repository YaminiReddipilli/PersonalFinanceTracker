const mongoose = require('mongoose');
const incomeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    icon:{
        type: String,
        default: "fa-solid fa-money-bill"
    },
    amount: {
        type: Number,
        required: true
    },
    source: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Income', incomeSchema);
