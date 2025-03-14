const express = require('express');
const { userAuth } = require('../middlewares/authMiddleware');
const Account = require('../models/accountModel');
const generateAccountNumber = require('../utils/generateAccoutNumber');

const accountRouter = express.Router();


accountRouter.post('/account/create', userAuth, async (req, res) => {
    try {
        const user = req.user;
        //check if account already exists
        const accountExists = await Account.findOne({ accountId: user._id });
        if (accountExists) {
            throw new Error("Account already exists");
        }

        //isProfileComplete
        if (user.isProfileComplete === false) {
            throw new Error("Complete your profile to create an account");
        }

        const account = new Account({ accountId: user._id });
        //generate account number that should be unique
        const accountNumber = await generateAccountNumber();
        account.accountNumber = accountNumber;

        await account.save();
        res.json({ message: "Account Created Successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

accountRouter.get('/account', userAuth, async (req, res) => {
    try {
        const user = req.user;
        const account = await Account.findOne({ accountId: user._id }).populate('accountId', 'firstName lastName email');
        res.json({ message: "Account Data Fetched", data: account });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
);


module.exports = accountRouter;