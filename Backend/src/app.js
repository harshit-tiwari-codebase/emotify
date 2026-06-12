const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth.routes");
const connectToDb = require("../src/config/database");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth",authRouter);
connectToDb();

app.get("/",(req , res)=>{
    res.send("server is running");
})

module.exports = app ;