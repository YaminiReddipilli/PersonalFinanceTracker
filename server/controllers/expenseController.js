const xlsx = require('xlsx');
const Expense = require('../models/Expense');

const addExpense = async (req, res) => {
    try {
        const { icon, amount, category, date } = req.body;
        const userId = req.user._id;

        const newExpense = new Expense({
            user: userId,
            icon,
            amount,
            category,
            date: new Date(date)
        });
        await newExpense.save();
        res.status(200).json({
            success: true,
            message: 'Expense added successfully',
            expense: newExpense
        });
    } catch (error) {
        console.error("Error adding expense:", error);
        res.status(500).json({ message: "Server error" });
    }
}

const getAllExpenses = async (req, res) => {
    try {
        const userId = req.user._id;
        const expenses = await Expense.find({ user: userId }).sort({ date: -1 });
        res.status(200).json({
            success: true,
            expenses
        });
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const deleteExpense = async (req, res) => {
    try {
        const expenseId = req.params.id;
        await Expense.findByIdAndDelete(expenseId);
        res.status(200).json({
            success: true,
            message: 'Expense deleted successfully'
        });
    } catch (error) {
        console.error("Error deleting expense:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const downloadExpenseExcel = async (req, res) => {
    try {
        const userId = req.user._id;
        const expenses = await Expense.find({ user: userId });
        
        if (expenses.length === 0) {
            return res.status(404).json({ message: "No expense records found" });
        }

        const data = expenses.map(expense => ({
            Amount: expense.amount,
            Category: expense.category,
            Date: expense.date.toISOString().split('T')[0], // Format date to YYYY-MM-DD
            Source: expense.source || 'manual',
            Merchant: expense.merchant || 'N/A'
        }));
        
        const ws = xlsx.utils.json_to_sheet(data);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Expenses");

        xlsx.writeFile(wb, "expenses_details.xlsx");
        
        res.download("expenses_details.xlsx", (err) => {
            if (err) {
                console.error("Error downloading file:", err);
                if (!res.headersSent) {
                    res.status(500).json({ message: "Error downloading file" });
                }
            }
        });
    } catch (error) {
        console.error("Error downloading expense Excel:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Server error" });
        }
    }
};

module.exports = {
    addExpense,
    getAllExpenses,
    deleteExpense,
    downloadExpenseExcel
};
