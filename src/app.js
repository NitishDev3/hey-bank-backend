//lib imports
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

//file imports
const connectToDatabase = require("./config/database");


//routers imports
const authRouter = require("./router/authRouter");
const profileRouter = require("./router/profileRouter");
const accountRouter = require("./router/accountRouter");
const transactionRouter = require("./router/transactionRouter");


//app
const app = express();

// middlewares
app.use(cors({ origin: "http://localhost:5174", credentials: true }));
app.use(express.json())
app.use(cookieParser());


//API Handlers
app.use("/", authRouter)
app.use("/", profileRouter)
app.use("/", accountRouter)
app.use("/", transactionRouter)




//default APP API Handler
app.use("/", (req, res) => {
    res.send("Hello from the app!")
})


//Connect to DB and server listening
connectToDatabase()
    .then(() => {
        console.log("DB connect successfully!!");
        app.listen(5555, () => {
            console.log("App is listening at 5555")
        })
    })
    .catch((error) => {
        console.log("ERROR: " + error.message)
    });