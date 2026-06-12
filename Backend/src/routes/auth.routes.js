const express = require("express");

const authController = require("../controllers/auth.controllers");

const authUser = require("../middlewares/auth.middlewares");

const authRouter = express.Router();

authRouter.post("/register", authController.registerUser);

authRouter.post("/login", authController.loginUser);

authRouter.get("/get-me", authUser, authController.GetUser);

authRouter.get("/logout" , authController.logoutUser);

module.exports = authRouter;
