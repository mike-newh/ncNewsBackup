const connection = require('../db/connection');

exports.getAllArticles = (req, res, next) => {
  const { limit = 10 } = req.query;
  if (isNaN(+limit)) return next({ status: 400, message: 'Bad limit syntax' });
  let { sort_by } = req.query;
  if (!isNaN(+sort_by)) return next({ status: 400, message: 'Bad column sort syntax' });
  const validSorts = ['title', 'article_id', 'created_by', 'body', 'created_at'];
  if (!validSorts.includes(sort_by)) sort_by = 'created_at';
  let { sort_ascending } = req.query;
  if (sort_ascending !== 'true') sort_ascending = false;
  const { page } = req.query;
  if (page !== undefined && isNaN(+page)) return next({ status: 400, message: 'Bad page syntax' });
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

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  connection('articles').select('articles.body', 'articles.title', 'articles.article_id', 'articles.votes', 'articles.created_at', 'articles.topic').count('comments.comment_id AS comment_count').leftJoin('users', 'users.user_id', '=', 'articles.created_by')
    .min('users.username AS author')
    .leftJoin('comments', 'comments.article_id', '=', 'articles.article_id')
    .groupBy('articles.article_id')
    .where('articles.article_id', article_id)
    .then((article) => {
      if (!article.length) return next({ status: 404, message: 'article id not found' });
      res.status(200).json({ article });
    });
};

exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  if (typeof inc_votes !== 'number' || (`${inc_votes}`).includes('.')) return next({ status: 400, message: 'Bad input' });
  connection('articles').where('article_id', '=', article_id)
    .increment('votes', inc_votes)
    .returning('*')
    .then((modifiedObject) => {
      if (!modifiedObject.length) return next({ status: 404, message: 'Article id not found' });
      res.status(201).json({ modifiedObject });
    })
    .catch(next);
};

exports.delArticleById = (req, res, next) => {
  const { article_id } = req.params;
  connection('articles').where('articles.article_id', article_id).del()
    .returning('*')
    .then((deleted) => {
      if (!deleted.length) return next({ status: 404, message: 'article id not found' });
      res.status(204).json({});
    })
    .catch(next);
};

exports.getCommentsByArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { limit = 10 } = req.query;
  if (isNaN(+limit)) return next({ status: 400, message: 'Bad limit syntax' });
  let { sort_by } = req.query;
  if (!isNaN(+sort_by)) return next({ status: 400, message: 'Bad column sort syntax' });
  const validSorts = ['body', 'article_id', 'comment_id', 'user_id', 'created_at', 'votes'];
  if (!validSorts.includes(sort_by)) sort_by = 'created_at';
  let { sort_ascending } = req.query;
  if (sort_ascending !== 'true') sort_ascending = false;
  const { p } = req.query;
  if (p !== undefined && isNaN(+p)) return next({ status: 400, message: 'Bad page syntax' });
  connection('comments').select('comments.comment_id', 'comments.votes', 'comments.created_at', 'users.username AS author', 'comments.body').join('users', 'users.user_id', '=', 'comments.user_id').where('article_id', article_id)
    .limit(limit)
    .orderBy(sort_by, sort_ascending ? 'asc' : 'desc')
    .modify((query) => {
      if (p) {
        query.offset((p - 1) * limit);
      }
    })
    .then((comments) => {
      if (!comments.length) return next({ status: 404, message: 'article id not found / article has no comments' });
      res.status(200).json({ comments });
    });
};

exports.postCommentToArticle = (req, res, next) => {
  if (req.body.body === undefined || req.body.user_id === undefined) { return next({ status: 400, message: 'Missing comment input fields' }); }
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
  if (typeof inc_votes !== 'number' || (`${inc_votes}`).includes('.')) return next({ status: 400, message: 'Bad input' });
  connection('comments').where('comment_id', '=', comment_id)
    .increment('votes', inc_votes)
    .returning('*')
    .then((modifiedObject) => {
      if (!modifiedObject.length) return next({ status: 404, message: 'comment id not found' });
      res.status(201).json({ modifiedObject });
    })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  connection('comments').where('comments.comment_id', comment_id).del()
    .returning('*')
    .then((deleted) => {
      if (!deleted.length) return next({ status: 404, message: 'comment id not found' });
      res.status(204).json({});
    })
    .catch(next);
};
