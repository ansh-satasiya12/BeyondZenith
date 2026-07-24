const express = require("express");
const router = express.Router();

const { registercontroller } = require('../controllers/auth.controller');

router.post('/register', registercontroller);

module.exports = router;
