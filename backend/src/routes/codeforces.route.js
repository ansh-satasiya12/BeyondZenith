const express = require('express');
const router = express.Router();

const {
    connectCodeforcesController,
    syncCodeforcesController,
    listSubmissionsController,
    getSubmissionController,
    listContestsController,
    getContestController,
    getCodeforcesAnalyticsController,
    getCodeforcesDashboardController,
    unlinkCodeforcesController,
} = require('../controllers/codeforces.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const asyncHandler = require('../utils/asyncHandler');
const { connectCodeforcesSchema } = require('../validators/codeforces.validator');

router.post('/connect', protect, validate(connectCodeforcesSchema), asyncHandler(connectCodeforcesController));
router.post('/sync', protect, asyncHandler(syncCodeforcesController));

router.get('/submissions', protect, asyncHandler(listSubmissionsController));
router.get('/submissions/:id', protect, asyncHandler(getSubmissionController));

router.get('/contests', protect, asyncHandler(listContestsController));
router.get('/contests/:id', protect, asyncHandler(getContestController));

router.get('/analytics', protect, asyncHandler(getCodeforcesAnalyticsController));
router.get('/dashboard', protect, asyncHandler(getCodeforcesDashboardController));

router.delete('/unlink', protect, asyncHandler(unlinkCodeforcesController));

module.exports = router;