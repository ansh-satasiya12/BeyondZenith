const express = require('express');

const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const authRouter = require('./routes/auth.routes');
const healthRouter = require('./routes/health.route');
const githubRouter = require('./routes/github.route');

const notFound = require('./middlewares/notFound.middleware');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));


app.use('/api/v1/auth', authRouter);
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/github', githubRouter);

app.use(notFound);

app.use(errorMiddleware)

module.exports = app;
