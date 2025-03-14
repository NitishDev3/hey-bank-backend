const mongoose = require("mongoose");


const accountSchema = new mongoose.Schema({
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    accountNumber: {
        type: Number,
        unique: true
    },
    accountBalance: {
        type: Number,
        default: 0
    }
},
    {
        timestamps: true,
    }
);

const Account = mongoose.model("Account", accountSchema);

module.exports = Account;