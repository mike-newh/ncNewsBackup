const topicRouter = require('express').Router();
const { getAllTopics, postTopic, getArticlesByTopic } = require('../controllers/topicControllers');
const { handle405 } = require('../errors');

topicRouter.route('/')
  .get(getAllTopics)
  .post(postTopic)
  .all(handle405);

topicRouter.route('/:topic/articles')
  .get(getArticlesByTopic)
  .all(handle405);
module.exports = topicRouter;
