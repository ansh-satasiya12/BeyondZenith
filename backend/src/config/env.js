const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGODB_URI = process.env.MONGODB_URI;

if (!PORT) {
  throw new Error('PORT environment variable is missing');
}

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is missing');
}

module.exports = Object.freeze({
  PORT,
  NODE_ENV,
  MONGODB_URI
});
