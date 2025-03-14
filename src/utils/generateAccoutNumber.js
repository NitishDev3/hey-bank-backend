const Account = require('../models/accountModel');
const generateAccountNumber = async () => {
    let accountNumber = Math.floor(100000000000 + Math.random() * 900000000000);
    const account = await Account.findOne({ accountNumber });
    if (account) {
        return generateAccountNumber();
    } else {
        return accountNumber;
    }
}
module.exports = generateAccountNumber