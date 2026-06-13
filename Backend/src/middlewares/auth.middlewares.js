const jwt = require("jsonwebtoken");
const userModel = require("../models/user.models");
const blacklistModel = require("../models/blacklist.models");
const redis = require("../config/cache")



const authUser = async (req, res, next) => {
  const token = req.cookies["registerToken"] || req.cookies["LoginToken"];

  if (!token) {
    return res.status(401).json({
      message: "token is not provided",
    });
  }
  const isTokenBlackListed = await redis.get(token)

  if(isTokenBlackListed){
    return res.status(401).json({
      message : "invalid token"
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }

  next()
};

module.exports = authUser;
