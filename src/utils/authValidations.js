const validator = require("validator");

const capitalizer = (str) => {
    return `${str.charAt(0).toUpperCase()}${str.slice(1).toLowerCase()}`;
}

const validateSignUpInputs = (req) => {
    const { emailId, password } = req.body;
    if (!validator.isEmail(emailId)) {
        throw new Error("Email ID is not valid.");
    }
    if (!validator.isStrongPassword(password)) {
        throw new Error("Password should be strong.")
    }
}

const validateLogInInputs = (req) => {
    const { emailId } = req.body;
    if (!validator.isEmail(emailId)) {
        throw new Error("Email ID is not valid.");
    }
}



module.exports = { validateSignUpInputs, capitalizer, validateLogInInputs }