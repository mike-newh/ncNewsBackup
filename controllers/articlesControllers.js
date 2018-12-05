const connection = require('../db/connection');

exports.getAllArticles = (req, res, next) => {
  connection('articles').select('users.username AS author', 'articles.title', 'articles.article_id', 'articles.votes', 'articles.created_at', 'articles.topic').count('comments.comment_id AS comment_count').join('users', 'users.user_id', '=', 'articles.created_by')
    .leftJoin('comments', 'comments.article_id', '=', 'articles.article_id')
    .groupBy('articles.article_id')
    .then(console.log);
}; // look in query builder
