const express = require("express");

const connectToDb = require("../src/config/database");

const app = express();

connectToDb();

app.get("/",(req , res)=>{
    res.send("server is running");
})

module.exports = app ;