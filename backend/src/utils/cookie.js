const { NODE_ENV, JWT_ACCESS_COOKIE_MAX_AGE } = require("../config/env");

const buildAuthCookie = (token) => {
    return {
        name: "accessToken",
        value: token,
        options: {
            httpOnly: true,
            secure: NODE_ENV === "production",
            sameSite: "lax",
            maxAge: JWT_ACCESS_COOKIE_MAX_AGE
        }
    }
};

module.exports = { buildAuthCookie };