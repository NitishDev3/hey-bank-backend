const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    fromAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account"
    },
    toAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account"
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: { values: ["success", "failed"], message: "Transaction status should be Success/Failed" }
    },
},
    {
        timestamps: true,
    }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;