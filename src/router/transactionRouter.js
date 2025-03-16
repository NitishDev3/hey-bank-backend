const express = require("express");
const { userAuth } = require("../middlewares/authMiddleware");
const Transaction = require("../models/tracsantionModel");
const Account = require("../models/accountModel");
const accountRouter = require("./accountRouter");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");

const transactionRouter = express.Router();


transactionRouter.post("/deposit", userAuth, async (req, res) => {
    try {
        const user = req.user;
        const { amount } = req.body;
        //check if amount is valid
        if (amount <= 0) {
            throw new Error("Invalid Amount");
        }
        //get user account
        const account = await Account.findOne({ accountId: user._id });
        //update account balance
        account.accountBalance += amount;
        await account.save();
        //return success message
        res.json({ message: "Deposit Successful" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

transactionRouter.post("/transfer", userAuth, async (req, res) => {
    try {
        const user = req.user;
        const { amount, receiverAccountNumber, password } = req.body;

        //check if account exists
        const receiverAccount = await Account.findOne({ accountNumber: receiverAccountNumber });
        if (!receiverAccount) {
            throw new Error("Receiver Account not found");
        }
        //check if receiver is the same as sender
        if (receiverAccount.accountId.toString() === user._id.toString()) {
            throw new Error("You can't transfer to your own account");
        }
        //check if amount is valid
        if (amount <= 0) {
            throw new Error("Invalid Amount");
        }
        //check if sender has enough balance
        const senderAccount = await Account.findOne({ accountId: user._id });
        if (senderAccount.accountBalance < amount) {
            throw new Error("Insufficient Balance");
        }
        //check password
        //get user password
        const sender = await User.findById(user._id);
        const isPasswordValid = await bcrypt.compare(password, sender.password);
        if (!isPasswordValid) {
            throw new Error("Invalid Password");
        }

        //update sender balance
        senderAccount.accountBalance -= amount;
        await senderAccount.save();
        //update receiver balance
        receiverAccount.accountBalance += amount;
        await receiverAccount.save();


        const transaction = new Transaction({
            fromAccountId: user._id,
            toAccountId: receiverAccount.accountId,
            amount,
            status: "success"
        });
        await transaction.save();
        //return success message
        res.json({ message: "Transaction Successful" });

    } catch (error) {
        //update failed transaction if password is invalid/insufficient balance only
        //get user
        const user = req.user;
        //get receiver account
        const { amount, receiverAccountNumber, password } = req.body;
        const receiverAccount = await Account.findOne({ accountNumber: receiverAccountNumber });
        if (error.message === "Insufficient Balance" || error.message === "Invalid Password") {
            const transaction = new Transaction({
                fromAccountId: user._id,
                toAccountId: receiverAccount.accountId,
                amount,
                status: "failed"
            });
            await transaction.save();
        }
        res.status(400).json({ message: error.message });
    }
}
);



transactionRouter.get('/transactions', userAuth, async (req, res) => {
    try {
        const user = req.user;

        // Fetch transactions and add type using aggregation
        const transactions = await Transaction.aggregate([
            {
                $match: {
                    $or: [
                        { fromAccountId: user._id },
                        { toAccountId: user._id }
                    ]
                }
            },
            {
                $lookup: {
                    from: "users", // Collection name for users
                    localField: "fromAccountId",
                    foreignField: "_id",
                    as: "fromAccount"
                }
            },
            {
                $lookup: {
                    from: "users", // Collection name for users
                    localField: "toAccountId",
                    foreignField: "_id",
                    as: "toAccount"
                }
            },
            //status of transaction
            {
                //status of transaction
                $addFields: {
                    status: {
                        $cond: {
                            if: { $eq: ["$status", "success"] },
                            then: "success",
                            else: "failed"
                        }
                    }
                }
            },
            {
                $unwind: "$fromAccount" // Unwind the fromAccount array
            },
            {
                $unwind: "$toAccount" // Unwind the toAccount array
            },
            {
                $addFields: {
                    type: {
                        $cond: {
                            if: { $eq: ["$fromAccountId", user._id] },
                            then: "debit",
                            else: "credit"
                        }
                    },
                    fromAccountName: {
                        $concat: ["$fromAccount.firstName", " ", "$fromAccount.lastName"]
                    },
                    toAccountName: {
                        $concat: ["$toAccount.firstName", " ", "$toAccount.lastName"]
                    }
                }
            },

            {
                $project: {
                    fromAccountId: 1,
                    toAccountId: 1,
                    amount: 1,
                    type: 1,
                    status: 1,
                    fromAccountName: 1,
                    toAccountName: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]).sort({ createdAt: -1 });

        res.json({
            message: "Transactions Fetched",
            data: transactions,
            totalTransactions: transactions.length
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "An error occurred while fetching transactions" });
    }
});


module.exports = transactionRouter;