const mongoose = require('mongoose');
const ExpenseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    icon: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true },
    source: { type: String, default: 'manual' }, // 'manual' or 'receipt'
    merchant: { type: String }, // For receipt-based expenses
    items: [{ // For detailed receipt items
        name: String,
        price: Number
    }]
});

module.exports = mongoose.model('Expense', ExpenseSchema);
