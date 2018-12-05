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
      if (!modifiedObject.length) next({ status: 404, message: 'Article id not found' });
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

exports.getCommentsByArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { limit = 10 } = req.query;
  const { sort_by = 'created_at' } = req.query;
  const { sort_ascending = false } = req.query;
  const { p } = req.query;
  connection('comments').select('comments.comment_id', 'comments.votes', 'comments.created_at', 'users.username AS author', 'comments.body').join('users', 'users.user_id', '=', 'comments.user_id').where('article_id', article_id)
    .limit(limit)
    .orderBy(sort_by, sort_ascending ? 'asc' : 'desc')
    .modify((query) => {
      if (p) {
        query.offset((p - 1) * limit);
      }
    })
    .then((comments) => {
      res.status(200).json({ comments });
    });
};

exports.postCommentToArticle = (req, res, next) => {
  if (req.body.body === undefined || req.body.user_id === undefined) { next({ status: 400, message: 'Missing comment input fields' }); }
  const { user_id, body } = req.body;
  const { article_id } = req.params;
  const newComment = { user_id, body, article_id };
  connection('comments').insert(newComment).returning('*')
    .then((postedComment) => {
      res.status(201).json({ postedComment });
    })
    .catch(next);
};

exports.patchCommentById = (req, res, next) => {
  const { article_id, comment_id } = req.params;
  const { inc_votes } = req.body;
  connection('comments').where('comment_id', '=', comment_id)
    .increment('votes', inc_votes)
    .returning('*')
    .then((modifiedObject) => {
      if (!modifiedObject.length) return next({ status: 404, message: 'comment id not found' });
      res.status(201).json({ modifiedObject });
    })
    .else(next);
};

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  connection('comments').where('comments.comment_id', comment_id).del()
    .returning('*')
    .then((deleted) => {
      res.status(202).json({});
    })
    .catch(next);
};
