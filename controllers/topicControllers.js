const connection = require('../db/connection');


exports.getAllTopics = (req, res, next) => connection.select('*').from('topics')
  .then((topics) => {
    res.status(200).json({ topics });
  }).catch(next);


exports.postTopic = (req, res, next) => {
  const { body } = req;
  connection('topics').insert(body).returning('*')
    .then(([addedTopic]) => {
      res.status(201).json(addedTopic);
    })
    .catch(next);
};

exports.getArticlesByTopic = (req, res, next) => {
  const { topic } = req.params;
  const { limit = 10 } = req.query;
  const { sort_by = 'created_at' } = req.query;
  const { sort_ascending = false } = req.query;
  const { page } = req.query;
  return connection('articles').select('articles.title', 'articles.topic', 'articles.created_by AS author', 'articles.article_id', 'articles.body', 'articles.created_at', 'articles.votes').count('comments.comment_id AS comment_count').groupBy('articles.article_id')
    .leftJoin('comments', 'comments.article_id', '=', 'articles.article_id')
    .where({ topic })
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

exports.postArticleByTopic = (req, res, next) => {
  const newObj = JSON.parse(JSON.stringify(req.body));
  if (!newObj.title || !newObj.body || !newObj.created_by) return next({ status: 400, message: 'Missing input field(s)' });
  newObj.topic = req.params.topic;
  connection('articles').insert(newObj).returning('*')
    .then((posted) => {
      res.status(201).json({ posted });
    })
    .catch(next);
};
