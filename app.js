var express = require('express');
var cluster = require('cluster');
var path = require('path');
var dotenv = require('dotenv').config();
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var db = mongoose.connection;

// Database
var mongodb_uri;
if (process.env.NODE_EN === "production") {
  mongodb_uri = process.env.MONGODB_URI;
} else {
  mongodb_uri = process.env.MONGODB_DEV_URI;
}
mongoose.Promise = global.Promise;
if (process.env.NODE_EN==="production") {
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect(process.env.MONGODB_DEV_URI);
}

db.on('error', console.error.bind(console, 'error connecting with mongodb database:'));

db.once('open', function() {
  console.log('connected to mongodb database');
});

db.on('disconnected', function () {
   //Reconnect on timeout
   if (process.env.NODE_EN==="production") {
     mongoose.connect(process.env.MONGODB_URI);
     db = mongoose.connection;
   } else {
     mongoose.connect(process.env.MONGODB_DEV_URI);
     db = mongoose.connection;
   }
});

// Route Declarations
var index = require('./routes/index');
var users = require('./routes/users');
var subscribe = require('./routes/subscribe');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/static', express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/subscribe', subscribe);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  if(process.env.NODE_EN==="development") {
    res.render('error')
  } else {
    res.redirect('/');
  }

});

module.exports = app;
