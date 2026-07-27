const express = require("express");
const router = express.Router();

const { registercontroller, loginController, refreshController, getMe, logoutController, changePasswordController } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema, changePasswordSchema } = require('../validators/auth.validator');

router.post('/register', validate(registerSchema), asyncHandler(registercontroller));
router.post('/login', validate(loginSchema), asyncHandler(loginController));
router.post('/refresh', asyncHandler(refreshController));
router.post('/logout', protect, asyncHandler(logoutController));
router.patch('/change-password', protect, validate(changePasswordSchema), asyncHandler(changePasswordController));
router.get('/me', protect, asyncHandler(getMe));


module.exports = router;
