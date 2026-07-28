const { getGitHubAuthUrl, exchangeCodeForAccessToken } = require('../services/github.service');
const AppError = require('../utils/AppError');

const connectGitHubController = async (req, res) => {
    const authUrl = await getGitHubAuthUrl();
    return res.redirect(authUrl);
}

const callbackGitHubController = async (req, res) => {
    const { code } = req.query;
    if (!code) {
        throw new AppError("Invalid GitHub callback", 400);
    }
    const accessToken = await exchangeCodeForAccessToken(code);
    return res.status(200).json({
        success: true,
        accessToken
    });
}

module.exports = { connectGitHubController, callbackGitHubController };