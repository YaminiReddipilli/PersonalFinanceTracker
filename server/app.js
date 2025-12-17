const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoute");
const receiptRoutes = require("./routes/receiptRoutes");

dotenv.config();

const app = express();

/* ================================
   ⏱ Request timeout configuration
   ================================ */
app.use((req, res, next) => {
  const timeout = req.path.includes("/receipt") ? 180000 : 30000;
  req.setTimeout(timeout);
  res.setTimeout(timeout);
  next();
});

/* ================================
   🌐 CORS Configuration (Render-safe)
   ================================ */
const allowedOrigins = [
  process.env.CLIENT_URL,        // Render frontend URL
  "http://localhost:5173"         // Local Vite dev
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

/* ================================
   📦 Body parsers
   ================================ */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* ================================
   🏠 Health check route
   ================================ */
app.get("/", (req, res) => {
  res.send("Welcome to the Personal Finance Tracker API 🚀");
});

/* ================================
   🗄️ Database connection
   ================================ */
connectDB();

/* ================================
   🔗 API Routes
   ================================ */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expenses", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/receipt", receiptRoutes);

/* ================================
   📁 Static uploads
   ================================ */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================================
   🚀 Start server (Render compatible)
   ================================ */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
