var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

if (process.env.NODE_EN === "development") {
  mongoose.createConnection(process.env.MONGODB_DEV_URI);
} else {
  mongoose.createConnection(process.env.MONGODB_URI);
}

var db = mongoose.connection;
var Schema = mongoose.Schema;

// User Schema
var NewsletterSchema = new Schema({
  email: {
    type: String,
    index: true
  },
  date: [Date]
});

var Newsletter = module.exports = mongoose.model('Newsletter', NewsletterSchema);

module.exports.subscribe = function(newUser, callback) {
    newUser.save(callback);
};

module.exports.findByEmail = function(email, callback) {
  var query = {email: email};
  Newsletter.findOne(query, callback);
};

module.exports.findById = function(id, callback) {
  Newsletter.findById(id, callback);
};
