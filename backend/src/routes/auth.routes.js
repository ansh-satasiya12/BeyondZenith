const express = require("express");
const router = express.Router();

const { registercontroller, loginController, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

router.post('/register', validate(registerSchema), asyncHandler(registercontroller));
router.post('/login', validate(loginSchema), asyncHandler(loginController));
router.get('/me', protect, asyncHandler(getMe));


module.exports = router;
