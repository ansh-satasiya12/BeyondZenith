const { registerUser, loginUser } = require('../services/auth.service');
const { buildAuthCookie } = require('../utils/cookie');


const registercontroller = async (req, res) => {
    const result = await registerUser(req.body);
    const cookie = buildAuthCookie(result.accessToken);
    res.cookie(cookie.name, cookie.value, cookie.options);

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
            user: result.user,
        }
    });
};

const loginController = async (req, res) => {
    const result = await loginUser(req.body);
    const cookie = buildAuthCookie(result.accessToken);
    res.cookie(cookie.name, cookie.value, cookie.options);
    res.status(200).json({
        success: true,
        message: "User logged in successfully",
        data: {
            user: result.user,
        }
    });
};

const getMe = (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            user: req.user,
        },
    });
};

module.exports = {
    registercontroller,
    loginController,
    getMe
};