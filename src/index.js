const dotenv = require('dotenv');
const sentry = require('@sentry/node');
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

sentry.init({ dsn: process.env.SENTRY_KEY });

app.use(sentry.Handlers.requestHandler());

const port = process.env.PORT || 5000;
const routes = require('./routes');

// configure bodyParser
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Disable standard Express header for security purposes
app.disable('x-powered-by');

// Make the routes and let them react on /v1
app.use('/v1', routes);

// Error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

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