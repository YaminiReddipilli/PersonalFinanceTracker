const express = require('express');
const router = express.Router();
const { extractExpenseFromReceipt, addExpenseFromReceipt } = require('../controllers/receiptController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddlewares');

// Route to extract expense data from receipt
router.post('/extract', protect, upload.single('receipt'), extractExpenseFromReceipt);

// Route to add expense from parsed receipt data
router.post('/add-expense', protect, addExpenseFromReceipt);

module.exports = router;
