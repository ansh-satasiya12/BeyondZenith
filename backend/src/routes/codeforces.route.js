const express = require('express');
const router = express.Router();

const { connectCodeforcesController, syncCodeforcesController } = require('../controllers/codeforces.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const asyncHandler = require('../utils/asyncHandler');
const { connectCodeforcesSchema } = require('../validators/codeforces.validator');

router.post('/connect', protect, validate(connectCodeforcesSchema), asyncHandler(connectCodeforcesController));
router.post('/sync', protect, asyncHandler(syncCodeforcesController));

module.exports = router;