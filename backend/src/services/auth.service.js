const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const AppError = require('../utils/AppError');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { JWT_REFRESH_SECRET } = require('../config/env');
const jwt = require('jsonwebtoken');

const registerUser = async (userData) => {
    const { name, email, password } = userData;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError("User already exists", 409);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    const userObject = user.toObject();
    delete userObject.password;
    const accessToken = generateAccessToken({
        id: user._id,
        email: user.email,
        role: user.role
    });

    const refreshToken = generateRefreshToken({
        id: user._id,
        email: user.email,
        role: user.role
    });

    user.refreshToken = refreshToken;
    await user.save();

    return {
        user: userObject,
        accessToken,
        refreshToken
    };

};

const loginUser = async (userData) => {
    const { email, password } = userData;
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError("Invalid credentials", 401);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new AppError("Invalid credentials", 401);
    }
    const userObject = user.toObject();
    delete userObject.password;
    const accessToken = generateAccessToken({
        id: user._id,
        email: user.email,
        role: user.role
    });

    const refreshToken = generateRefreshToken({
        id: user._id,
        email: user.email,
        role: user.role
    });

    user.refreshToken = refreshToken;
    await user.save();
    return {
        user: userObject,
        accessToken,
        refreshToken
    };

};

const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new AppError("Unauthorized", 401);
    }
    let decodedToken;
    try {
        decodedToken = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (error) {
        throw new AppError("unauthorized", 401);
    }

    const user = await User.findById(decodedToken.id);
    if (!user) {
        throw new AppError("unauthorized", 401);
    }
    if (user.refreshToken !== refreshToken) {
        throw new AppError("unauthorized", 401);
    }
    const accessToken = generateAccessToken({
        id: user._id,
        email: user.email,
        role: user.role
    });
    const newRefreshToken = generateRefreshToken({
        id: user._id,
        email: user.email,
        role: user.role
    });
    user.refreshToken = newRefreshToken;
    await user.save();
    return {
        accessToken,
        newRefreshToken
    };
};

const logoutUser = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("unauthorized", 401);
    }
    user.refreshToken = null;
    await user.save();
}

const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("unauthorized", 401);
    }
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
        throw new AppError("Invalid credentials", 401);
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.refreshToken = null;
    await user.save();
}

module.exports = {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    changePassword
};
