const express = require("express");
const musicController = require("../controllers/music.controllers");
const authUser = require("../middlewares/auth.middlewares");

const musicRouter = express.Router();

// Public routes for browsing mood playlists
musicRouter.get("/categories", musicController.getMoodCategories);
musicRouter.get("/mood/:mood", musicController.getTracksByMood);

// Authenticated user routes for favorites and mood logs
musicRouter.get("/favorites", authUser, musicController.getFavorites);
musicRouter.post("/favorites", authUser, musicController.toggleFavorite);

musicRouter.get("/history", authUser, musicController.getMoodHistory);
musicRouter.post("/history", authUser, musicController.logMoodSession);

module.exports = musicRouter;
