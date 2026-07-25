const express = require("express");
const router = express.Router();

const { registercontroller, loginController } = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const asyncHandler = require('../utils/asyncHandler');

router.post('/register', validate(registerSchema), asyncHandler(registercontroller));
router.post('/login', validate(loginSchema), asyncHandler(loginController));

module.exports = router;
