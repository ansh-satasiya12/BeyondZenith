const express = require("express");
const router = express.Router();

const { registercontroller } = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const registerSchema = require('../validators/auth.validator');
const asyncHandler = require('../utils/asyncHandler');

router.post('/register', validate(registerSchema), asyncHandler(registercontroller));

module.exports = router;
