const mongoose = require("mongoose");

const blacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "token is required"],
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const blacklistModel = mongoose.model("blacklisted_tokens", blacklistSchema);

module.exports = blacklistModel;