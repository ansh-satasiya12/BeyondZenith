const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const AppError = require('../utils/AppError');
const { generateAccessToken } = require('../utils/jwt');

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
        role: user.role || "user"
    });

    const userObject = user.toObject();
    delete userObject.password;
    const accessToken = generateAccessToken({
        id: user._id,
        email: user.email,
        role: user.role
    });
    return {
        user: userObject,
        accessToken
    };

};

module.exports = {
    registerUser,
};
