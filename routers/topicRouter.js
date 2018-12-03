const topicRouter = require('express').Router();
const { getAllTopics } = require('../controllers/topicControllers');

topicRouter.get('/', getAllTopics);

module.exports = topicRouter;
