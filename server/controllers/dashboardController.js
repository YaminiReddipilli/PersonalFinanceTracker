const Income = require('../models/Income');
const Expense = require('../models/Expense');
const { Types } = require('mongoose');

const getDashboardData = async (req, res) => {
    try {
        const userId = req.user._id;
        const userObjectId = new Types.ObjectId(userId);

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalIncomeData = await Income.aggregate([
            { $match: { user: userObjectId } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const totalExpenseData = await Expense.aggregate([
            { $match: { user: userObjectId } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const recentIncomeTransactions = await Income.find({
            user: userObjectId,
            date: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) }
        }).sort({ date: -1 }).limit(60);

        const incomeTotal = recentIncomeTransactions.reduce((sum, transaction) => {
            return sum + transaction.amount;
        }, 0);

        const recentExpenseTransactions = await Expense.find({
            user: userObjectId,
            date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }).sort({ date: -1 }).limit(30);

        const expenseTotal = recentExpenseTransactions.reduce((sum, transaction) => {
            return sum + transaction.amount;
        }, 0);

        const userExpenses = await Expense.find({ user: userObjectId }).sort({ date: -1 });
        const userIncome = await Income.find({ user: userObjectId }).sort({ date: -1 });

        // Combine and sort all transactions for pagination
        const combinedTransactions = [
            ...userIncome.map(t => ({ ...t.toObject(), type: 'income' })),
            ...userExpenses.map(t => ({ ...t.toObject(), type: 'expense' }))
        ].sort((a, b) => b.date - a.date);

        const totalCount = combinedTransactions.length;
        const paginatedData = combinedTransactions.slice(skip, skip + limit);
        const recentTransactionsList = combinedTransactions.slice(0, 5);

        // Category-wise expense breakdown
        const expensesByCategory = await Expense.aggregate([
            { $match: { user: userObjectId } },
            { 
                $group: { 
                    _id: "$category", 
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                } 
            },
            { $sort: { total: -1 } }
        ]);

        const incomeBySource = await Income.aggregate([
            { $match: { user: userObjectId } },
            { 
                $group: { 
                    _id: "$source", 
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                } 
            },
            { $sort: { total: -1 } }
        ]);

        const currentYear = new Date().getFullYear();
        const monthlyExpenseData = await Expense.aggregate([
            { 
                $match: { 
                    user: userObjectId,
                    date: {
                        $gte: new Date(currentYear, 0, 1),
                        $lt: new Date(currentYear + 1, 0, 1)
                    }
                } 
            },
            {
                $group: {
                    _id: { $month: "$date" },
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const monthlyIncomeData = await Income.aggregate([
            { 
                $match: { 
                    user: userObjectId,
                    date: {
                        $gte: new Date(currentYear, 0, 1),
                        $lt: new Date(currentYear + 1, 0, 1)
                    }
                } 
            },
            {
                $group: {
                    _id: { $month: "$date" },
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Yearly comparison analysis
        const yearlyData = await Promise.all([
            Expense.aggregate([
                { $match: { user: userObjectId } },
                {
                    $group: {
                        _id: { $year: "$date" },
                        total: { $sum: "$amount" }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Income.aggregate([
                { $match: { user: userObjectId } },
                {
                    $group: {
                        _id: { $year: "$date" },
                        total: { $sum: "$amount" }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        const [yearlyExpenseData, yearlyIncomeData] = yearlyData;

        res.status(200).json({
            success: true,
            totalBalance: (totalIncomeData[0]?.total || 0) - (totalExpenseData[0]?.total || 0),
            totalIncome: totalIncomeData[0]?.total || 0,
            totalExpenses: totalExpenseData[0]?.total || 0,
            last30DaysExpenses: {
                total: expenseTotal,
                transactions: recentExpenseTransactions
            },
            last60DaysIncome: {
                total: incomeTotal,
                transactions: recentIncomeTransactions
            },
            recentTransactions: recentTransactionsList,
            // Pagination implementation for transaction list
            transactions: {
                data: paginatedData,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                    totalItems: totalCount,
                    itemsPerPage: limit
                }
            },
            allExpenses: userExpenses,
            allIncome: userIncome,
            expensesByCategory,
            incomeBySource,
            monthlyExpenses: monthlyExpenseData,
            monthlyIncome: monthlyIncomeData,
            yearlyExpenses: yearlyExpenseData,
            yearlyIncome: yearlyIncomeData,
            statistics: {
                totalTransactions: totalCount,
                avgTransaction: totalCount > 0 ? (totalIncomeData[0]?.total + totalExpenseData[0]?.total) / totalCount : 0,
                savingsRate: totalIncomeData[0]?.total > 0 ? ((totalIncomeData[0]?.total - totalExpenseData[0]?.total) / totalIncomeData[0]?.total) * 100 : 0
            }
        });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getDashboardData
};
