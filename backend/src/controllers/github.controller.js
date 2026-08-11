const {
    getGitHubAuthUrl,
    exchangeCodeForAccessToken,
    fetchGitHubProfile,
    connectGitHub,
    syncGitHubRepositories,
    getRepositories,
    getRepositoryById,
    getRepositoryAnalytics,
    getGitHubDashboard,
    enhanceRepository,
    syncGitHubProfile,
    unlinkGitHub,
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

    return res.redirect(
        `${process.env.FRONTEND_URL}/settings?github=connected`
    );
};

const syncGitHubController = async (req, res) => {
    const userId = req.user.id;
    const summary = await syncGitHubRepositories(userId);

    return res.status(200).json({
        success: true,
        message: "Repositories synchronized successfully",
        data: summary
    });
};

const listRepositoriesController = async (req, res) => {
    const userId = req.user.id;
    const data = await getRepositories(userId, req.query);

    return res.status(200).json({
        success: true,
        data,
    });
};

const getRepositoryController = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const repository = await getRepositoryById(userId, id);

    return res.status(200).json({
        success: true,
        data: { repository },
    });
};

const analyticsController = async (req, res) => {
    const userId = req.user.id;
    const data = await getRepositoryAnalytics(userId);

    return res.status(200).json({
        success: true,
        data,
    });
};

const dashboardController = async (req, res) => {
    const userId = req.user.id;

    const data = await getGitHubDashboard(userId);

    return res.status(200).json({
        success: true,
        data,
    });
};

const enhanceRepositoryController = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const repository = await enhanceRepository(userId, id);

    return res.status(200).json({
        success: true,
        message: "Repository enhanced successfully",
        data: {
            repository,
        },
    });
};

const syncGitHubProfileController = async (req, res) => {
    const profile = await syncGitHubProfile(req.user.id);

    return res.status(200).json({
        success: true,
        message: "GitHub profile synchronized successfully",
        data: {
            profile,
        },
    });
};

const unlinkGitHubController = async (req, res) => {
    const userId = req.user.id;
    const summary = await unlinkGitHub(userId);

    return res.status(200).json({
        success: true,
        message: "GitHub account unlinked successfully",
        data: summary,
    });
};

module.exports = {
    connectGitHubController,
    callbackGitHubController,
    syncGitHubController,
    listRepositoriesController,
    getRepositoryController,
    analyticsController,
    dashboardController,
    enhanceRepositoryController,
    syncGitHubProfileController,
    unlinkGitHubController,
};