var express = require('express');
var router = express.Router();
var User = require('../src/models/newsletter');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.redirect('/');
});

// POST to the Database

router.post('/', function(req, res, next) {
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

module.exports = router;
