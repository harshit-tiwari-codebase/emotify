const mongoose = require("mongoose");

const moodHistorySchema = new mongoose.Schema({
  emotion: {
    type: String,
    required: true,
  },
  confidence: {
    type: Number,
    default: 1.0,
  },
  detectedAt: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    default: "",
  },
});

const favoriteTrackSchema = new mongoose.Schema({
  trackId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  mood: {
    type: String,
    required: true,
  },
  audioUrl: {
    type: String,
    required: true,
  },
  artwork: {
    type: String,
    default: "",
  },
  duration: {
    type: String,
    default: "3:00",
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: [true, "username is required"],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "email is required"],
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      select: false,
    },
    avatar: {
      type: String,
      default: "",
    },
    favorites: [favoriteTrackSchema],
    moodHistory: [moodHistorySchema],
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
