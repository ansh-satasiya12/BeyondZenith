const crypto = require("crypto");

const generateOAuthState = () => {
    return crypto.randomBytes(32).toString("hex");
};

module.exports = {
    generateOAuthState,
};