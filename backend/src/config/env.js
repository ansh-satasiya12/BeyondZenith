const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN;
const JWT_ACCESS_COOKIE_MAX_AGE = Number(process.env.JWT_ACCESS_COOKIE_MAX_AGE);
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN;
const JWT_REFRESH_COOKIE_MAX_AGE = Number(process.env.JWT_REFRESH_COOKIE_MAX_AGE);

if (!PORT) {
  throw new Error('PORT environment variable is missing');
}

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is missing');
}

module.exports = Object.freeze({
  PORT,
  NODE_ENV,
  MONGODB_URI,
  JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRES_IN,
  JWT_ACCESS_COOKIE_MAX_AGE,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
  JWT_REFRESH_COOKIE_MAX_AGE
});
