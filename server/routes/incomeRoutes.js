const express = require('express');
const router = express.Router();
const { getAllIncomes, addIncome, downloadIncomeExcel, deleteIncome } = require('../controllers/incomeController');
const {protect} = require('../middlewares/authMiddleware');
router.get('/get', protect, getAllIncomes);
router.post('/add', protect, addIncome);
router.get('/downloadexcel', protect, downloadIncomeExcel);
router.delete('/:id', protect, deleteIncome);

module.exports = router;
