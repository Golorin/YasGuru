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
  mongoose.connect(process.env.MONGODB_URI, {
    useMongoClient: true,
  });
} else {
  mongoose.connect(process.env.MONGODB_DEV_URI, {
    useMongoClient: true,
  });
}

db.on('error', console.error.bind(console, 'error connecting with mongodb database:'));

db.once('openUri', function() {
  console.log('connected to mongodb database');
});

db.on('disconnected', function () {
   //Reconnect on timeout
   if (process.env.NODE_EN==="production") {
     mongoose.connect(process.env.MONGODB_URI, {
       useMongoClient: true,
     });
     db = mongoose.connection;
   } else {
     mongoose.connect(process.env.MONGODB_DEV_URI, {
       useMongoClient: true,
     });
     db = mongoose.connection;
   }
});

// Route Declarations
var api = require('./routes/api');
var users = require('./routes/users');
var subscribe = require('./routes/subscribe');

var app = express();
app.locals.moment = require('moment');

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
app.use(express.static(path.join(__dirname, 'client/build')));

app.use('/api', api);
app.use('/users', users);
app.use('/subscribe', subscribe);

app.get('*', function(req, res, next) {
  // Serve static index.html in client/build if other routes don't match.
  res.sendFile(path.join(__dirname,'client/build/index.html'));
});

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
