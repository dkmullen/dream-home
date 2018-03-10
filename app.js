/*jshint esversion: 6 */
const express = require('express'),
  path = require('path'),
  favicon = require('serve-favicon'),
  logger = require('morgan'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  config = require('./config'),
  routes = require('./routes/routes'),
  member = require('./models/member'),
  user = require('./models/user'),
  app = express();

mongoose.connect(config.mongoUrl, { useMongoClient: true });
mongoose.Promise = global.Promise;
app.set('secret', config.secret);

app.use(favicon(path.join(__dirname, 'public/resources', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/routes', routes);

routes(app);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
});

module.exports = app;
// DEBUG=dirapp:* npm start
