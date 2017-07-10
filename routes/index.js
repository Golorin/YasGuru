var express = require('express');
var router = express.Router();
var path = require('path');
var _ = require('underscore');
var contentful = require('contentful');
var client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: process.env.CONTENTFUL_SPACE_ID,
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: process.env.CONTENTFUL_TOKEN
})
// This API call will request an entry with the specified ID from the space defined at the top, using a space-specific access token.

router.get('*', function(req, res, next) {
  // Serve static index.html in client/build if other routes don't match.
  res.sendFile(path.resolve(__dirname,'..','/client/build/index.html'));
});


module.exports = router;
