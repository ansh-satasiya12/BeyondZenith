const { registerUser, loginUser, refreshAccessToken } = require('../services/auth.service');
const { buildAccessTokenCookie, buildRefreshTokenCookie } = require('../utils/cookie');


const registercontroller = async (req, res) => {
    const result = await registerUser(req.body);
    const accessTokenCookie = buildAccessTokenCookie(result.accessToken);
    const refreshTokenCookie = buildRefreshTokenCookie(result.refreshToken);
    res.cookie(accessTokenCookie.name, accessTokenCookie.value, accessTokenCookie.options);
    res.cookie(refreshTokenCookie.name, refreshTokenCookie.value, refreshTokenCookie.options);

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
    const accessTokenCookie = buildAccessTokenCookie(result.accessToken);
    const refreshTokenCookie = buildRefreshTokenCookie(result.refreshToken);
    res.cookie(accessTokenCookie.name, accessTokenCookie.value, accessTokenCookie.options);
    res.cookie(refreshTokenCookie.name, refreshTokenCookie.value, refreshTokenCookie.options);
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

const refreshController = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    const result = await refreshAccessToken(refreshToken);
    const accessTokenCookie = buildAccessTokenCookie(result.accessToken);
    const refreshTokenCookie = buildRefreshTokenCookie(result.newRefreshToken);
    res.cookie(accessTokenCookie.name, accessTokenCookie.value, accessTokenCookie.options);
    res.cookie(refreshTokenCookie.name, refreshTokenCookie.value, refreshTokenCookie.options);
    res.status(200).json({
        success: true,
        message: "Tokens refreshed successfully",
    });

};

module.exports = {
    registercontroller,
    loginController,
    getMe,
    refreshController
};