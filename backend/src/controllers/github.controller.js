const {
    getGitHubAuthUrl,
    exchangeCodeForAccessToken,
    fetchGitHubProfile,
    connectGitHub
} = require('../services/github.service');
const AppError = require('../utils/AppError');
const { generateOAuthState } = require('../utils/oauth');
const {
    saveOAuthState,
    getOAuthState,
    deleteOAuthState
} = require('../utils/oauthStore');

const connectGitHubController = async (req, res) => {
    const userId = req.user.id;
    const state = generateOAuthState();
    saveOAuthState(state, userId);
    const authUrl = getGitHubAuthUrl(state);
    return res.redirect(authUrl);
};

const callbackGitHubController = async (req, res) => {
    const { code, state } = req.query;

    if (!code || !state) {
        throw new AppError("Unauthorized", 401);
    }

    const storedState = getOAuthState(state);
    if (!storedState) {
        throw new AppError("Unauthorized", 401);
    }

    const { userId } = storedState;

    deleteOAuthState(state);

    const accessToken = await exchangeCodeForAccessToken(code);
    const profile = await fetchGitHubProfile(accessToken);
    await connectGitHub(userId, profile, accessToken);

    return res.status(200).json({
        success: true,
        message: "GitHub account connected successfully"
    });
};

module.exports = { connectGitHubController, callbackGitHubController };