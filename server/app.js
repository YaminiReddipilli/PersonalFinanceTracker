const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const dashboardRoutes = require('./routes/dashboardRoute');
const receiptRoutes = require('./routes/receiptRoutes');
const path = require('path');

dotenv.config();

const app = express();

// Request timeout configuration for OCR processing
app.use((req, res, next) => {
    const timeout = req.path.includes('/receipt') ? 180000 : 30000;
    req.setTimeout(timeout);
    res.setTimeout(timeout);
    next();
});

app.use(cors({
    origin: process.env.CLIENT_URL || "*",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Welcome to the Personal Finance Assistant API");
});

connectDB();

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expenses", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/receipt", receiptRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
