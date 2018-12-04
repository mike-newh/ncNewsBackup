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
  return connection('articles').select('articles.title', 'articles.topic', 'articles.created_by AS author', 'articles.article_id', 'articles.body', 'articles.created_at', 'articles.votes').count('comments.comment_id AS comment_count').groupBy('articles.article_id')
    .join('comments', 'comments.article_id', '=', 'articles.article_id')
    .where({ topic })
    .then((articles) => {
      console.log(articles);
      res.status(200).json({ articles });
    });
};


// res.status(200).json({ topics });
//   return Promise.all([connection('articles').where({ topic }), queryCount])
