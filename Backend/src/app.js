const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRouter = require("./routes/auth.routes");
const musicRouter = require("./routes/music.routes");
const connectToDb = require("./config/database");

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all local development origins or no origin (like mobile/curl)
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Connect database
connectToDb();

// Routes
app.use("/api/auth", authRouter);
app.use("/api/music", musicRouter);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Emotify Backend API",
    time: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.send("Emotify Server is running smoothly");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

module.exports = app;
