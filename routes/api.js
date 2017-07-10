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

router.get('/videos/retrieve', function(req, res, next) {
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
    console.log(latestCta);
    var sortedEpisodes = _.sortBy(episodes, 'episodeNumber');
    var latestEpisode = _.last(sortedEpisodes);
    console.log(sortedEpisodes);

    res.json({
      episodes: sortedEpisodes
    });
  });
});

router.get('/posts/retrieve', function(req, res, next) {
  client.getEntries({
    content_type: 'blogPost',
    select: 'fields.title,fields.cover,fields.author,fields.post,fields.categories',
    order: 'sys.createdAt',
    include: 7
  }).then((entries) => {
    // Map Only the fields for the post we need to an array.
    var posts = _.map(entries.items, function(item) {
      console.log("ITEM: ", item);
      // Entry identifying items are within the item.sys object.
      var id = item.sys.id;
      var createdAt = item.sys.createdAt;
      var updatedAt = item.sys.updatedAt;
      // Entry content is within the item.fields object.
      // Use the getter in the response object to set the CategoriesList variable to iterate through and add to a new array which will be included in an extend of the post object.
      var categoriesList = item.fields.categories;
      var categories = _.map(categoriesList, function(category) {
        return category.fields.categoryName;
      });
      var post = _.extend(item.fields, {
        category: categories,
        id: id,
        createdAt,
        updatedAt,
      });
      // Return the post data with the categories included under "category" property.
      return post;
    });

    console.log("Here are the posts: ", posts);
    res.json(posts)
  }).catch(function(err) {
    console.log(err);
  });
});


module.exports = router;
