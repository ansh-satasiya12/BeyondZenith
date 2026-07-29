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

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL;
const GITHUB_TOKEN_ENCRYPTION_KEY = process.env.GITHUB_TOKEN_ENCRYPTION_KEY;

if (!PORT) {
  throw new Error('PORT environment variable is missing');
}

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is missing');
}

if (!GITHUB_CLIENT_ID) {
  throw new Error('GITHUB_CLIENT_ID environment variable is missing');
}

if (!GITHUB_CLIENT_SECRET) {
  throw new Error('GITHUB_CLIENT_SECRET environment variable is missing');
}

if (!GITHUB_CALLBACK_URL) {
  throw new Error('GITHUB_CALLBACK_URL environment variable is missing');
}

if (!GITHUB_TOKEN_ENCRYPTION_KEY) {
  throw new Error('GITHUB_TOKEN_ENCRYPTION_KEY environment variable is missing');
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
  JWT_REFRESH_COOKIE_MAX_AGE,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL,
  GITHUB_TOKEN_ENCRYPTION_KEY
});
