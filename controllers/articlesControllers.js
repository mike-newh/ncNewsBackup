const connection = require('../db/connection');

exports.getAllArticles = (req, res, next) => {
  const { limit = 10 } = req.query;
  const { sort_by = 'created_at' } = req.query;
  const { sort_ascending = false } = req.query;
  const { page } = req.query;
  connection('articles').select('articles.title', 'articles.article_id', 'articles.votes', 'articles.created_at', 'articles.topic').count('comments.comment_id AS comment_count').leftJoin('users', 'users.user_id', '=', 'articles.created_by')
    .min('users.username AS author')
    .leftJoin('comments', 'comments.article_id', '=', 'articles.article_id')
    .groupBy('articles.article_id')
    .limit(limit)
    .orderBy(sort_by, sort_ascending ? 'asc' : 'desc')
    .modify((query) => {
      if (page) {
        query.offset((page - 1) * limit);
      }
    })
    .then((articles) => {
      if (!articles.length) return next({ status: 404, message: 'Page not found' });
      res.status(200).json({ articles });
    });
};

exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  connection('articles').where('article_id', '=', article_id)
    .increment('votes', inc_votes)
    .returning('*')
    .then((modifiedObject) => {
      if (!modifiedObject.length) return next({ status: 404, message: 'Article id not found' });
      res.status(201).json({ modifiedObject });
    })
    .else(next);
};


exports.delArticleById = (req, res, next) => {
  const { article_id } = req.params;
  connection('articles').where('articles.article_id', article_id).del()
    .returning('*')
    .then(() => {
      res.status(202).json({});
    })
    .catch(next);
};
