const {
    fetchCodeforcesProfile,
    connectCodeforces,
    syncCodeforcesData,
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

module.exports = { connectCodeforcesController, syncCodeforcesController };