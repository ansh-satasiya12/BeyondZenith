const express = require('express');
const router = express.Router();

const {
    connectLeetCodeController,
    syncLeetCodeController,
    getLeetCodeProfileController,
    listLeetCodeContestsController,
    getLeetCodeContestController,
    getLeetCodeAnalyticsController,
    getLeetCodeDashboardController,
    unlinkLeetCodeController,
} = require('../controllers/leetcode.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const asyncHandler = require('../utils/asyncHandler');
const { connectLeetCodeSchema } = require('../validators/leetcode.validator');

router.post('/connect', protect, validate(connectLeetCodeSchema), asyncHandler(connectLeetCodeController));
router.post('/sync', protect, asyncHandler(syncLeetCodeController));

router.get('/profile', protect, asyncHandler(getLeetCodeProfileController));
router.get('/contests', protect, asyncHandler(listLeetCodeContestsController));
router.get('/contests/:id', protect, asyncHandler(getLeetCodeContestController));

router.get('/analytics', protect, asyncHandler(getLeetCodeAnalyticsController));
router.get('/dashboard', protect, asyncHandler(getLeetCodeDashboardController));

router.delete('/unlink', protect, asyncHandler(unlinkLeetCodeController));

module.exports = router;