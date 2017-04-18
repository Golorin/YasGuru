var express = require('express');
var router = express.Router();
var _ = require('underscore');
var contentful = require('contentful');
var client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: process.env.CONTENTFUL_SPACE_ID,
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: process.env.CONTENTFUL_TOKEN
})
// This API call will request an entry with the specified ID from the space defined at the top, using a space-specific access token.

/* GET home page. */
router.get('/', function(req, res, next) {
  client.getEntries()
  .then((entries) => {
    // console.log(entries.items);
    // console.log(entries.sys.type);
    var fields = _.pluck(entries.items, 'fields');
    // console.log(fields);
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
    var sortedCta = _.sortBy(cta, 'date');
    var latestCta = _.last(cta);
    console.log(latestCta);
    var sortedEpisodes = _.sortBy(episodes, 'episodeNumber');
    var latestEpisode = _.last(sortedEpisodes);
    res.render('index', {
      episodes: episodes,
      latest: latestEpisode,
      cta: latestCta
    });
  });

});

module.exports = router;
