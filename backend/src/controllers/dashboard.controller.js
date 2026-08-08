const { getUnifiedDashboard } = require('../services/dashboard.service');

const getUnifiedDashboardController = async (req, res) => {
    const userId = req.user.id;

    const dashboard = await getUnifiedDashboard(userId);

    return res.status(200).json({
        success: true,
        data: dashboard,
    });
};

module.exports = { getUnifiedDashboardController };