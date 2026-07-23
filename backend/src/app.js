const express = require('express');

const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const healthRouter = require('./routes/health.route');
const notFound = require('./middlewares/notFound.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use('/api/v1/health', healthRouter);

app.use(notFound);

module.exports = app;
