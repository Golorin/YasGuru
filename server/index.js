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
var _ = require('underscore');
var User = require('../src/models/newsletter');
// var cache = require('../src/middleware/mcache');

// Interact with Contentful CMS
var contentful = require('contentful');
var client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: process.env.CONTENTFUL_SPACE_ID,
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: process.env.CONTENTFUL_TOKEN
})


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
app.use('/static', express.static(path.resolve(__dirname,'..','public')));
app.use(express.static(path.resolve(__dirname,'..','client/build')));


// This API call will request an entry with the specified ID from the space defined at the top, using a space-specific access token.

app.get('/api/videos/retrieve', function(req, res, next) {
  client.getEntries()
  .then((entries) => {
    // console.log(entries.items);
    // console.log(entries.sys.type);
    var fields = _.pluck(entries.items, 'fields');
    // console.log(fields);
    var banner = _.filter(fields, function(field) {
        var isBanner = _.has(field, "headline");
        if(isBanner) {
          return field;
        } else {
          return false;
        }
    });
    var episodes = _.filter(fields, function(field) {
        var isEpisode = _.has(field, "episodeNumber");
        if(isEpisode) {
          return field;
        } else {
          return false;
        }
    });
    var cta = _.filter(fields, function(field) {
        var isCta = _.has(field, "ctaHeadline");
        if(isCta) {
          return field;
        } else {
          return false;
        }
    });
    var sortedBanner = _.sortBy(banner, 'id');
    var latestBanner = _.last(sortedBanner);
    var sortedCta = _.sortBy(cta, 'date');
    var latestCta = _.last(cta);
    // console.log(latestCta);
    var sortedEpisodes = _.sortBy(episodes, 'episodeNumber');
    var latestEpisode = _.last(sortedEpisodes);
    // console.log(sortedEpisodes);

    res.json({
      episodes: sortedEpisodes
    });
  });
});

app.get('/api/posts/retrieve', function(req, res, next) {
  client.getEntries({
    content_type: 'blogPost',
    select: 'fields.title,fields.cover,fields.author,fields.post,fields.categories',
    order: 'sys.createdAt',
    include: 7
  }).then((entries) => {
    // Map Only the fields for the post we need to an array.
    var posts = _.map(entries.items, function(item) {
      // Entry identifying items are within the item.sys object.
      var { id, createdAt, updatedAt } = item.sys;

      // Entry content is within the item.fields object.
      // Use the getter in the response object to set the CategoriesList variable to iterate through and add to a new array which will be included in an extend of the post object.
      var categoriesList = item.fields.categories;
      var categories = _.map(categoriesList, function(category) {
        return category.fields.categoryName;
      });

      var image = {
        url: item.fields.cover.fields.file.url,
        title: item.fields.cover.fields.title,
      }
      var author = item.fields.author.fields.name;

      var post = Object.assign({}, {
        title: item.fields.title,
        post: item.fields.post,
        category: categories,
        id,
        createdAt,
        updatedAt,
        image,
        author,
      });
      // Return the post data with the categories included under "category" property.
      return post;
    });

    res.json(posts)
  }).catch(function(err) {
    console.log(err);
    res.status(400).json({
      statusCode: 400,
      message: "There was an error fetching the videos."
    });
  });
});

app.get('/api/sample', function(req, res, next) {
  client.getEntries()
  .then((entries) => {
    res.json(entries.items[0]);
  }).catch((err) => {
    res.status(400).json({
      statusCode: 400,
      message: "There was an error fetching the samples."
    });
  });
});

// Subscribe POST to the Database
app.post('/subscribe', function(req, res, next) {
  var email = req.body.email;
  var newUser = new User({
    email: email,
    date: new Date()
  });

  User.subscribe(newUser, function(err, user) {
    if(err) {
      console.error("There was an error adding the user to the newsletter.");
      console.error(err);
      res.status(400).json({
        "statusCode": 400,
        "message" : "That email address is already subscribed."
      });
    } else {
      console.log("The user was added to the newsletter.");
      console.log(user);
      res.status(201).json({
        "statusCode": 201,
        "message": "Your email was added to the mailing list. Thank you!"
      });
    }
  });
});

app.get('*', function(req, res, next) {
  // Serve static index.html in client/build if other routes don't match.
  res.sendFile(path.resolve(__dirname,'../client/build','index.html'));
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
  res.render('error')
  // if(process.env.NODE_EN==="development") {
  //   res.render('error')
  // } else {
  //   res.redirect('/');
  // }

});

module.exports = app;
