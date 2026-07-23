const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!PORT) {
  throw new Error('PORT environment variable is missing');
}

module.exports = Object.freeze({
  PORT,
  NODE_ENV,
});
