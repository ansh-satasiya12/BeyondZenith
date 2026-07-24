const { registerUser } = require('../services/auth.service');

const registercontroller = async (req, res) => {
    const result = await registerUser(req.body);
    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result
    });
};

module.exports = {
    registercontroller,
};