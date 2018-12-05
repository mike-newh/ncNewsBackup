const moment = require('moment');

exports.artDateFormat = (articleData, lookupObj) => articleData.map((article) => {
  const newArt = {};
  newArt.title = article.title;
  newArt.topic = article.topic;
  newArt.body = article.body;
  newArt.created_at = moment(article.created_at).format('YYYY-MM-DD');
  newArt.created_by = lookupObj[article.created_by];
  return newArt;
});
// article.created_at = moment(article.created_at).format('YYYY-MM-DD');
// article.created_by = lookupObj[article.created_by];
// return article;

exports.makeUserLookup = userData => userData.reduce((acc, user) => {
  const key = user.username;
  acc[key] = user.user_id;
  return acc;
}, {});

exports.makeArticleLookup = articleData => articleData.reduce((acc, article) => {
  acc[article.title] = article.article_id;
  return acc;
}, {});


exports.formatArticles = (commentData, articleLookup, userLookup) => commentData.map((comment) => {
  const newComment = {};
  newComment.user_id = userLookup[comment.created_by];
  newComment.article_id = articleLookup[comment.belongs_to];
  newComment.created_at = moment(comment.created_at).format('YYYY-MM-DD');
  newComment.votes = comment.votes;
  newComment.body = comment.body;
  return newComment;
});
