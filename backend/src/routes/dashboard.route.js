const express = require('express');
const router = express.Router();

const { getUnifiedDashboardController } = require('../controllers/dashboard.controller');
const { protect } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', protect, asyncHandler(getUnifiedDashboardController));

module.exports = router;