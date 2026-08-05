const express = require('express');
const router = express.Router();

const { connectCodeforcesController } = require('../controllers/codeforces.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { connectCodeforcesSchema } = require('../validators/codeforces.validator');
const asyncHandler = require('../utils/asyncHandler');

router.post('/connect', protect, validate(connectCodeforcesSchema), asyncHandler(connectCodeforcesController));

module.exports = router;