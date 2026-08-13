const { NODE_ENV, JWT_ACCESS_COOKIE_MAX_AGE, JWT_REFRESH_COOKIE_MAX_AGE } = require("../config/env");

const buildAccessTokenCookie = (token) => {
    return {
        name: "accessToken",
        value: token,
        options: {
            httpOnly: true,
            secure: NODE_ENV === "production",
            sameSite: NODE_ENV === "production" ? "none" : "lax",
            maxAge: JWT_ACCESS_COOKIE_MAX_AGE
        }
    }
};

const buildRefreshTokenCookie = (token) => {
    return {
        name: "refreshToken",
        value: token,
        options: {
            httpOnly: true,
            secure: NODE_ENV === "production",
            sameSite: NODE_ENV === "production" ? "none" : "lax",
            maxAge: JWT_REFRESH_COOKIE_MAX_AGE
        }
    }
};

const buildClearAccessTokenCookie = () => {
    return {
        name: "accessToken",
        options: {
            httpOnly: true,
            secure: NODE_ENV === "production",
            sameSite: NODE_ENV === "production" ? "none" : "lax",
        }
    }
};

const buildClearRefreshTokenCookie = () => {
    return {
        name: "refreshToken",
        options: {
            httpOnly: true,
            secure: NODE_ENV === "production",
            sameSite: NODE_ENV === "production" ? "none" : "lax",
        }
    }
};

module.exports = {
    buildAccessTokenCookie,
    buildRefreshTokenCookie,
    buildClearAccessTokenCookie,
    buildClearRefreshTokenCookie
};