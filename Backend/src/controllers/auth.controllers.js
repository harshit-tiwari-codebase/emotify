const userModel = require("../models/user.models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const blacklistModel = require("../models/blacklist.models");
const cache = require("../config/cache");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
    },
    process.env.JWT_SECRET || "emotify_secret_key_jwt",
    { expiresIn: "3d" }
  );
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and password are required",
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    const isUserAlreadyExist = await userModel.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });

    if (isUserAlreadyExist) {
      return res.status(409).json({
        success: false,
        message: "User already exists with that username or email",
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      username: cleanUsername,
      email: cleanEmail,
      password: hash,
    });

    const token = generateToken(user);

    // Set cookies (support both uniform 'token' and backward-compatible 'registerToken' / 'LoginToken')
    res.cookie("token", token, COOKIE_OPTIONS);
    res.cookie("registerToken", token, COOKIE_OPTIONS);
    res.cookie("LoginToken", token, COOKIE_OPTIONS);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        favoritesCount: 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if ((!username && !email) || !password) {
      return res.status(400).json({
        success: false,
        message: "Username/email and password are required",
      });
    }

    const identifier = (email || username || "").trim().toLowerCase();

    const user = await userModel
      .findOne({
        $or: [{ email: identifier }, { username: identifier }],
      })
      .select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    const token = generateToken(user);

    res.cookie("token", token, COOKIE_OPTIONS);
    res.cookie("LoginToken", token, COOKIE_OPTIONS);
    res.cookie("registerToken", token, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        favoritesCount: user.favorites ? user.favorites.length : 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};

const GetUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fetched user data successfully",
      userId,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        favorites: user.favorites || [],
        moodHistory: (user.moodHistory || []).slice(-15),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    const token =
      req.cookies?.token ||
      req.cookies?.LoginToken ||
      req.cookies?.registerToken ||
      req.headers?.authorization?.replace(/^Bearer\s+/i, "");

    res.clearCookie("token", COOKIE_OPTIONS);
    res.clearCookie("LoginToken", COOKIE_OPTIONS);
    res.clearCookie("registerToken", COOKIE_OPTIONS);

    if (token) {
      // Blacklist in cache (3 days TTL)
      await cache.set(`bl_${token}`, Date.now().toString(), "EX", 3 * 24 * 60 * 60);

      // Blacklist in MongoDB (safely ignore duplicates)
      try {
        await blacklistModel.updateOne({ token }, { token }, { upsert: true });
      } catch (dbErr) {
        // Ignored
      }
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Logout failed",
    });
  }
};

module.exports = { registerUser, loginUser, GetUser, logoutUser };
