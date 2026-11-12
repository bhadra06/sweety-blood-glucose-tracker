
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");

// Import all routes FIRST
const authRoutes = require("./routes/authRoutes");
const readingRoutes = require("./routes/readingRoutes");
const reportRoutes = require("./routes/reportRoutes");
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173"
}));

app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/readings", readingRoutes);
app.use("/api/reports", reportRoutes);


// Welcome route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Sweety Blood Glucose Tracker API"
  });
});

// Database health check
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.status(200).json({
      status: "success",
      message: "Server and PostgreSQL connected successfully",
      databaseTime: result.rows[0].now
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Database connection failed"
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Sweety API running on http://localhost:${PORT}`);
});
