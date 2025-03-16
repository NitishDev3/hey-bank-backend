const jwt = require("jsonwebtoken");
const User = require("../models/userModel")


const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            throw new Error("Session Timeout: Please Log In!");
        }
        const { id } = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById({ _id: id }).select("-password -__v -createdAt -updatedAt");
        if (!user) {
            throw new Error("User not found: Please Log In!");
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}


module.exports = { userAuth };