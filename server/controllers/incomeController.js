const Income = require('../models/Income');
const path = require('path');
const mongoose = require('mongoose');
const xlsx = require('xlsx');


exports.addIncome = async (req, res) => {
    try {
        const {icon, amount, source, date } = req.body;
        const userId = req.user._id;

        if (!icon || !amount || !source || !date) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const income = await Income.create({
            user: userId,
            icon,
            amount,
            source,
            date:new Date(date)
        });

        res.status(201).json(income);
    } catch (error) {
        console.error("Error adding income:", error);
        res.status(500).json({ message: "Server error" });
    }
}
exports.getAllIncomes = async (req, res) => {
    try {
        const userId = req.user._id;
        const incomes = await Income.find({ user: userId }).sort({ date: -1 });

        res.status(200).json(incomes);
    } catch (error) {
        console.error("Error fetching incomes:", error);
        res.status(500).json({ message: "Server error" });
    }
}
exports.deleteIncome = async (req, res) => {
    try {
        const incomeId = req.params.id;
        const userId = req.user._id;

        const income = await Income.findOneAndDelete({ _id: incomeId, user: userId });

        if (!income) {
            return res.status(404).json({ message: "Income not found" });
        }

        res.status(200).json({ message: "Income deleted successfully" });
    } catch (error) {
        console.error("Error deleting income:", error);
        res.status(500).json({ message: "Server error" });
    }
}
exports.downloadIncomeExcel = async (req, res) => {
    const userId = req.user._id;
    try {
        const incomes = await Income.find({ user: userId }).sort({ date: -1 });

        if (incomes.length === 0) {
            return res.status(404).json({ message: "No income records found" });
        }

        const data = incomes.map(income => ({
            Amount: income.amount,
            Source: income.source,
            Date: income.date.toISOString().split('T')[0] // Format date to YYYY-MM-DD
        }));

        
        const ws = xlsx.utils.json_to_sheet(data);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'Incomes');
        xlsx.writeFile(wb, "income_details.xlsx");

        res.download("income_details.xlsx", (err) => {
            if (err) {
                console.error("Error downloading file:", err);
                res.status(500).json({ message: "Error downloading file" });
            }
        });
    } catch (error) {
        console.error("Error downloading income Excel:", error);
        res.status(500).json({ message: "Server error" });
    }   
}

