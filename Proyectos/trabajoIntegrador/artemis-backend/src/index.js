const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const booksRoutes = require("./routes/books");
const chaptersRoutes = require("./routes/chapters");
const interactionsRoutes = require("./routes/interactions"); // NUEVO
const commentsRoutes = require("./routes/comments"); // NUEVO

const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "*", // En producción, especifica tu dominio
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware (útil para debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", booksRoutes);
app.use("/api/chapters", chaptersRoutes);
app.use("/api/interactions", interactionsRoutes); // NUEVO
app.use("/api/comments", commentsRoutes); // NUEVO

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Artemis API is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
  console.log(`\n📚 Available routes:`);
  console.log(`   - /api/auth`);
  console.log(`   - /api/books`);
  console.log(`   - /api/chapters`);
  console.log(`   - /api/interactions (NEW)`);
  console.log(`   - /api/comments (NEW)`);
});

module.exports = app;
