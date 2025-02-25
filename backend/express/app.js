var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

const database = require('./database');
const uploadRouter = require('./routes/upload');
const { attachWebSocket } = require('./websocket');
var transcriptRouter = require('./routes/transcript');
var settingsRouter = require('./routes/settings');
var summarizeRouter = require('./routes/summarize');

database.init();
var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json({ limit: '250mb' }));
app.use(express.urlencoded({ extended: false, limit: '250mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/transcript', transcriptRouter);
app.use('/api/v1/settings', settingsRouter);
app.use('/api/v1/summarize', summarizeRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).json({
    error: err.message
  });
});

// Export both app and attachWebSocket
module.exports = { app, attachWebSocket };
