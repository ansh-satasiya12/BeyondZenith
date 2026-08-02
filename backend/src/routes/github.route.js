const express = require("express");
const router = express.Router();

const {
    connectGitHubController,
    callbackGitHubController,
    syncGitHubController,
    listRepositoriesController,
    getRepositoryController,
    analyticsController,
    dashboardController,
    enhanceRepositoryController,
    syncGitHubProfileController
} = require('../controllers/github.controller');
const { protect } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

router.get('/connect', protect, asyncHandler(connectGitHubController));
router.get('/callback', asyncHandler(callbackGitHubController));
router.post('/sync', protect, asyncHandler(syncGitHubController));
router.get('/repositories', protect, asyncHandler(listRepositoriesController));
router.get('/repositories/:id', protect, asyncHandler(getRepositoryController));
router.get('/analytics', protect, asyncHandler(analyticsController));
router.get('/dashboard', protect, asyncHandler(dashboardController));
router.post("/repositories/:id/enhance", protect, asyncHandler(enhanceRepositoryController));
router.post("/profile/sync", protect, asyncHandler(syncGitHubProfileController));

module.exports = router;
