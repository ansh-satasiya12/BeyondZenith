const mongoose = require("mongoose");
const dns = require("node:dns");
const { MONGODB_URI } = require("./env");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URI);
        console.log(`MongoDB connected successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection failure: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;