const { registerUser } = require('../services/auth.service');

const registercontroller = async (req, res) => {
    const data = await registerUser(req.body);
    res.json(data);
};

module.exports = {
    registercontroller,
};