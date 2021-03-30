const dotenv = require('dotenv');
const express = require('express');
const app = express();
const sentry = require('@sentry/node');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

sentry.init({ dsn: process.env.SENTRY_KEY });

app.use(sentry.Handlers.requestHandler());

const port = process.env.PORT || 5000;
const routes = require('./routes');

const corsOptions = {
  origin: process.env.NODE_ENV === 'development' ? '*' : 'https://crowdcapture.org',
  optionsSuccessStatus: 200,
}

// configure bodyParser
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const limiter = new rateLimit({
  windowMs: 60 * 1000,
  max: 6
});

app.use(limiter);

// Disable standard Express header for security purposes
app.disable('x-powered-by');

// Make the routes and let them react on /v1
app.use('/v1', routes);

app.use(sentry.Handlers.errorHandler());

// Error handler
app.use(function (err, req, res, next) {
  // render the error page
  res.status(err.status || 500).send(err);
});

// Start our server
// When unit tests are running they stop and start the server themselves
// or else they give a port used error.
if (process.env.NODE_ENV != 'test') {
    app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
}

module.exports = app;