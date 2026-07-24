const { registerservice } = require('../services/auth.service');

const registercontroller = async (req, res) => {
    const data = await registerservice();
    res.json(data);
};

module.exports = {
    registercontroller,
};