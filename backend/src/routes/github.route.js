const express = require("express");
const router = express.Router();

const {
    connectGitHubController,
    callbackGitHubController,
    syncGitHubController
} = require('../controllers/github.controller');
const { protect } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

router.get('/connect', protect, asyncHandler(connectGitHubController));
router.get('/callback', asyncHandler(callbackGitHubController));
router.post('/sync', protect, asyncHandler(syncGitHubController));

module.exports = router;

