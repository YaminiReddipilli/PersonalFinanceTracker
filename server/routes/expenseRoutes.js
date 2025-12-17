const express = require('express');
const router = express.Router();
const {addExpense, getAllExpenses, deleteExpense, downloadExpenseExcel} = require('../controllers/expenseController');
const {protect} = require('../middlewares/authMiddleware');
router.post('/add',protect, addExpense);
router.get('/get', protect, getAllExpenses);
router.delete('/:id', protect, deleteExpense);
router.get('/downloadexcel', protect, downloadExpenseExcel);

module.exports = router;
