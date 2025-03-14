const express = require("express");
const { userAuth } = require("../middlewares/authMiddleware");
const User = require("../models/userModel")


const profileRouter = express.Router();


profileRouter.get("/profile", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.json({ message: "Profile Data Fetched", data: user })
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})


profileRouter.patch("/profile/update", userAuth, async (req, res) => {
    try {
        //allowed updates
        const allowedUpdateFields = ["firstName", "lastName", "profilePhotoUrl", "age", "gender", "city"];
        const isUpdateFieldsValid = Object.keys(req.body).every(data => allowedUpdateFields.includes(data));
        if (!isUpdateFieldsValid) {
            throw new Error("Update Fileds are not valid! Kindly Check.");
        }

        //get logged in user
        const loggedInUserId = req.user._id;

        //update
        const updatedUser = await User.findOneAndUpdate(loggedInUserId, req.body);

        res.json({ message: "Profile Updated Successfully" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})


module.exports = profileRouter;