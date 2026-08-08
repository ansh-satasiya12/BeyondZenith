const {
    fetchLeetCodeProfile,
    connectLeetCode,
    syncLeetCodeData,
    getLeetCodeProfile,
    listLeetCodeContests,
    getLeetCodeContest,
    getLeetCodeAnalytics,
    getLeetCodeDashboard,
    unlinkLeetCode,
} = require('../services/leetcode.service');

const connectLeetCodeController = async (req, res) => {
    const userId = req.user.id;
    const { username } = req.body;

    const profile = await fetchLeetCodeProfile(username);
    const user = await connectLeetCode(userId, profile);

    return res.status(200).json({
        success: true,
        message: 'LeetCode account connected successfully',
        data: { leetcode: user.leetcode },
    });
};

const syncLeetCodeController = async (req, res) => {
    const userId = req.user.id;

    const summary = await syncLeetCodeData(userId);

    return res.status(200).json({
        success: true,
        message: 'LeetCode data synced successfully',
        data: summary,
    });
};

const getLeetCodeProfileController = async (req, res) => {
    const userId = req.user.id;

    const profile = await getLeetCodeProfile(userId);

    return res.status(200).json({
        success: true,
        data: { profile },
    });
};

const listLeetCodeContestsController = async (req, res) => {
    const userId = req.user.id;

    const result = await listLeetCodeContests(userId, req.query);

    return res.status(200).json({
        success: true,
        data: result.contests,
        pagination: result.pagination,
    });
};

const getLeetCodeContestController = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const contest = await getLeetCodeContest(userId, id);

    return res.status(200).json({
        success: true,
        data: { contest },
    });
};

const getLeetCodeAnalyticsController = async (req, res) => {
    const userId = req.user.id;

    const analytics = await getLeetCodeAnalytics(userId);

    return res.status(200).json({
        success: true,
        data: analytics,
    });
};

const getLeetCodeDashboardController = async (req, res) => {
    const userId = req.user.id;

    const dashboard = await getLeetCodeDashboard(userId);

    return res.status(200).json({
        success: true,
        data: dashboard,
    });
};

const unlinkLeetCodeController = async (req, res) => {
    const userId = req.user.id;

    await unlinkLeetCode(userId);

    return res.status(200).json({
        success: true,
        message: 'LeetCode account unlinked successfully',
    });
};

module.exports = {
    connectLeetCodeController,
    syncLeetCodeController,
    getLeetCodeProfileController,
    listLeetCodeContestsController,
    getLeetCodeContestController,
    getLeetCodeAnalyticsController,
    getLeetCodeDashboardController,
    unlinkLeetCodeController,
};