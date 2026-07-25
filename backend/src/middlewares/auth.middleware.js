const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { JWT_ACCESS_SECRET } = require('../config/env');

const protect = asyncHandler(async (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) {
        throw new AppError("Unauthorized", 401);
    }
    const decodedToken = jwt.verify(token, JWT_ACCESS_SECRET);
    const user = await User.findById(decodedToken.id).select("-password");
    if (!user) {
        throw new AppError("Unauthorized", 401);
    }
    req.user = user;
    next();
});

module.exports = { protect };