const userModel = require("../models/user.models");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const blacklistModel = require("../models/blacklist.models");
const redis = require("../config/cache");

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const isUserAlreadyExist = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (isUserAlreadyExist) {
      return res.status(409).json({
        message: "user already exist with same username or password",
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      username,
      email,
      password: hash,
    });

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3d" },
    );

    res.cookie("registerToken", token);

    res.status(201).json({
      message: "user registered successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      error: error,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await userModel.findOne({
      $or: [{ email }, { username }],
    }).select("+password");
    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const IsPasswordValid = await bcrypt.compare(password, user.password);

    if (!IsPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3d" },
    );

    res.cookie("LoginToken", token);

    return res.status(201).json({
      message: "user registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const GetUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId)
    res.status(200).json({
      message: "fetched the user data successfully",
      userId,
      user
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


const logoutUser = async (req, res) => {
  res.clearCookie("LoginToken");
  res.clearCookie("registerToken"); 

  const token = req.cookies["LoginToken"];

  if(!token){
    return res.status(401).json({
      message: "token is required"
    })
  }

  redis.set(token ,Date.now().toString(),"EX",60*60)

  
  
  return res.status(200).json({ message: "Logged out successfully" });
};


module.exports = { registerUser, loginUser, GetUser , logoutUser};
