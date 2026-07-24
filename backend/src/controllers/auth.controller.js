const { registerservice } = require('../services/auth.service');

const registercontroller = (req, res) => {
    const data = registerservice();
    res.json(data);
};

module.exports = {
    registercontroller,
};