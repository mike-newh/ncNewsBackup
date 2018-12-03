const moment = require('moment');

exports.artDateFormat = (articleData, lookupObj) => articleData.map((article) => {
  article.created_at = moment(article.created_at).format('YYYY-MM-DD');
  article.created_by = lookupObj[article.created_by];
  return article;
});

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
  comment.user_id = userLookup[comment.created_by];
  comment.article_id = articleLookup[comment.belongs_to];
  comment.created_at = moment(comment.created_at).format('YYYY-MM-DD');
  delete comment.created_by;
  delete comment.belongs_to;
  console.log(comment);
  return comment;
});
