const { fetchCodeforcesProfile, connectCodeforces } = require('../services/codeforces.service');

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

module.exports = { connectCodeforcesController };