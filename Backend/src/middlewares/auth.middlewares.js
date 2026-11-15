const jwt = require("jsonwebtoken");
const blacklistModel = require("../models/blacklist.models");
const cache = require("../config/cache");

const extractToken = (req) => {
  if (req.cookies) {
    if (req.cookies.token) return req.cookies.token;
    if (req.cookies.LoginToken) return req.cookies.LoginToken;
    if (req.cookies.registerToken) return req.cookies.registerToken;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }
  return null;
};

const authUser = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is required",
    });
  }

  try {
    // 1. Check in fast cache (Redis or in-memory)
    const isTokenBlackListedInCache = await cache.get(`bl_${token}`);
    if (isTokenBlackListedInCache) {
      return res.status(401).json({
        success: false,
        message: "Token has been invalidated. Please log in again.",
      });
    }

    // 2. Check in Mongo blacklist
    const isBlacklistedInDb = await blacklistModel.findOne({ token });
    if (isBlacklistedInDb) {
      return res.status(401).json({
        success: false,
        message: "Token has been invalidated. Please log in again.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "emotify_secret_key_jwt");
    req.user = decoded;
    req.rawToken = token;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.name === "TokenExpiredError" ? "Session expired" : "Invalid token",
    });
  }
};

module.exports = authUser;
