const connection = require('../db/connection');


exports.getAllTopics = (req, res, next) => connection.select('*').from('topics')
  .then((topics) => {
    res.status(200).json({ topics });
  }).catch(next);


exports.postTopic = (req, res, next) => {
  const { body } = req;
  if (!isNaN(+body.slug)) { return next({ status: 400, message: 'malformed body' }); }
  connection('topics').insert(body).returning('*')
    .then(([topic]) => {
      res.status(201).json({ topic });
    })
    .catch(next);
};

exports.getArticlesByTopic = (req, res, next) => {
  const { topic } = req.params;
  const { limit = 10 } = req.query;
  if (isNaN(+limit) || `${limit}`.includes('.')) return next({ status: 400, message: 'Bad limit syntax' });
  let { sort_by } = req.query;
  if (!isNaN(+sort_by)) return next({ status: 400, message: 'Bad column sort syntax' });
  const validSorts = ['title', 'article_id', 'created_by', 'body', 'created_at'];
  if (!validSorts.includes(sort_by)) sort_by = 'created_at';
  let { sort_ascending } = req.query;
  if (sort_ascending !== 'true') sort_ascending = false;
  const { p } = req.query;
  if ((p !== undefined && isNaN(+p)) || `${p}`.includes('.')) return next({ status: 400, message: 'Bad page syntax' });
  return connection('articles').select('articles.title', 'articles.topic', 'articles.created_by AS author', 'articles.article_id', 'articles.created_at', 'articles.votes').count('comments.comment_id AS comment_count').groupBy('articles.article_id')
    .leftJoin('comments', 'comments.article_id', '=', 'articles.article_id')
    .where({ topic })
    .limit(limit)
    .orderBy(sort_by, sort_ascending ? 'asc' : 'desc')
    .modify((query) => {
      if (p) {
        query.offset((p - 1) * limit);
      }
    })
    .then((articles) => {
      if (!articles.length) return next({ status: 404, message: 'Page not found' });
      res.status(200).json({ articles });
    });
};

exports.postArticleByTopic = (req, res, next) => {
  const newObj = JSON.parse(JSON.stringify(req.body));
  if (!newObj.title || !newObj.body || !newObj.created_by) return next({ status: 400, message: 'Missing input field(s)' });
  newObj.topic = req.params.topic;
  connection('articles').insert(newObj).returning('*')
    .then(([article]) => {
      res.status(201).json({ article });
    })
    .catch(next);
};
