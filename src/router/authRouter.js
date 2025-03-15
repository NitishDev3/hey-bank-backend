const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel")
const { validateSignUpInputs, capitalizer, validateLogInInputs } = require("../utils/authValidations")


const authRouter = express.Router();


authRouter.post("/signup", async (req, res) => {

    try {
        validateSignUpInputs(req);
        const { firstName, lastName, emailId, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            firstName: capitalizer(firstName),
            lastName: capitalizer(lastName),
            emailId: emailId.toLowerCase(),
            password: hashedPassword
        });
        await user.save();

        res.json({ message: "User Created Successfully" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

authRouter.post("/login", async (req, res) => {
    try {
        validateLogInInputs(req);
        const { emailId, password } = req.body;

        const user = await User.findOne({ emailId: emailId.toLowerCase() });
        if (!user) {
            throw new Error("Invalid Credentials");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid Credentials");
        } else {
            const token = jwt.sign({ id: user._id }, "Heybank@789", { expiresIn: "1d" });
            res.cookie("token", token, { expires: new Date(Date.now() + 86400000), httpOnly: true, secure: false });
            //donot send password in response
            user.password = undefined;
            res.json({ message: "Log In Successful", data : user });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }

})

module.exports = authRouter;