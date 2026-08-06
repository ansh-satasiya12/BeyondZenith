const {
    fetchCodeforcesProfile,
    connectCodeforces,
    syncCodeforcesData,
    listSubmissions,
    getSubmission,
    listContests,
    getContest,
    getCodeforcesAnalytics,
    getCodeforcesDashboard,
    unlinkCodeforces,
} = require('../services/codeforces.service');

const connectCodeforcesController = async (req, res) => {
    const userId = req.user.id;
    const { handle } = req.body;

    const profile = await fetchCodeforcesProfile(handle);
    const user = await connectCodeforces(userId, profile);

    return res.status(200).json({
        success: true,
        message: 'Codeforces account connected successfully',
        data: { codeforces: user.codeforces },
    });
};

const syncCodeforcesController = async (req, res) => {
    const userId = req.user.id;

    const summary = await syncCodeforcesData(userId);

    return res.status(200).json({
        success: true,
        message: 'Codeforces data synced successfully',
        data: summary,
    });
};

const listSubmissionsController = async (req, res) => {
    const userId = req.user.id;

    const result = await listSubmissions(userId, req.query);

    return res.status(200).json({
        success: true,
        message: 'Submissions retrieved successfully',
        data: result.submissions,
        pagination: result.pagination,
    });
};

const getSubmissionController = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const submission = await getSubmission(userId, id);

    return res.status(200).json({
        success: true,
        message: 'Submission retrieved successfully',
        data: { submission },
    });
};

const listContestsController = async (req, res) => {
    const userId = req.user.id;

    const result = await listContests(userId, req.query);

    return res.status(200).json({
        success: true,
        message: 'Contests retrieved successfully',
        data: result.contests,
        pagination: result.pagination,
    });
};

const getContestController = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const contest = await getContest(userId, id);

    return res.status(200).json({
        success: true,
        message: 'Contest retrieved successfully',
        data: { contest },
    });
};

const getCodeforcesAnalyticsController = async (req, res) => {
    const userId = req.user.id;

    const analytics = await getCodeforcesAnalytics(userId);

    return res.status(200).json({
        success: true,
        message: 'Codeforces analytics retrieved successfully',
        data: analytics,
    });
};

const getCodeforcesDashboardController = async (req, res) => {
    const userId = req.user.id;

    const dashboard = await getCodeforcesDashboard(userId);

    return res.status(200).json({
        success: true,
        data: dashboard,
    });
};

const unlinkCodeforcesController = async (req, res) => {
    const userId = req.user.id;

    const summary = await unlinkCodeforces(userId);

    return res.status(200).json({
        success: true,
        message: 'Codeforces account unlinked successfully',
        summary,
    });
};

module.exports = {
    connectCodeforcesController,
    syncCodeforcesController,
    listSubmissionsController,
    getSubmissionController,
    listContestsController,
    getContestController,
    getCodeforcesAnalyticsController,
    getCodeforcesDashboardController,
    unlinkCodeforcesController,
};