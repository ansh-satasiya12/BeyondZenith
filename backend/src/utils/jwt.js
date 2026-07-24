const { JWT_ACCESS_SECRET, JWT_ACCESS_EXPIRES_IN } = require('../config/env');
const jwt = require('jsonwebtoken');

const generateAccessToken = (payload) => {
    return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRES_IN });
}

module.exports = {
    generateAccessToken
}