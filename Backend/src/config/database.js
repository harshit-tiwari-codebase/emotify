const mongoose = require("mongoose");

async function connectToDb() {
  try {
    const rawUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/emotifyDB";
    const cleanUri = rawUri.trim().replace(/;+\s*$/, "");
    await mongoose.connect(cleanUri);
    console.log("Connected to MongoDB database successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
}

module.exports = connectToDb;
