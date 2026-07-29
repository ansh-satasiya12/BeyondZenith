const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL } = require('../config/env');
const User = require('../models/user.model');
const AppError = require('../utils/AppError');
const { encrypt, decrypt } = require('../utils/encryption');

const getGitHubAuthUrl = (state) => {
    const url = new URL("https://github.com/login/oauth/authorize");

    url.searchParams.set("client_id", GITHUB_CLIENT_ID);
    url.searchParams.set("redirect_uri", GITHUB_CALLBACK_URL);
    url.searchParams.set("scope", "read:user user:email");
    url.searchParams.set("state", state);

    return url.toString();
};

const exchangeCodeForAccessToken = async (code) => {
    const response = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code
        })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new AppError(data.error_description || "Failed to exchange code", response.status);
    }
    return data.access_token;
};

const fetchGitHubProfile = async (accessToken) => {
    const response = await fetch("https://api.github.com/user", {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "User-Agent": "BeyondZenith-App",
            "Accept": "application/json"
        }
    });

    const data = await response.json();
    if (!response.ok) {
        throw new AppError(data.message || "Failed to fetch GitHub profile", response.status);
    }
    return data;
};

const connectGitHub = async (userId, profile, accessToken) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    const existingUser = await User.findOne({
        "github.id": profile.id,
    });

    if (existingUser && !existingUser._id.equals(userId)) {
        throw new AppError("GitHub account already linked", 409);
    }

    user.github = {
        id: String(profile.id),
        username: profile.login,
        name: profile.name || null,
        avatarUrl: profile.avatar_url || null,
        profileUrl: profile.html_url || null,
        accessToken: encrypt(accessToken),
        connectedAt: new Date()
    };

    await user.save();
    return user;
};

const getDecryptedGitHubToken = (user) => {
    if (!user || !user.github || !user.github.accessToken) {
        return null;
    }
    return decrypt(user.github.accessToken);
};

module.exports = {
    getGitHubAuthUrl,
    exchangeCodeForAccessToken,
    fetchGitHubProfile,
    connectGitHub,
    getDecryptedGitHubToken
};