const mongoose = require("mongoose");

const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING);
    } catch (error) {
        console.log("Error Connecting to DB: " + error.message)
    }
}


module.exports = connectToDatabase;