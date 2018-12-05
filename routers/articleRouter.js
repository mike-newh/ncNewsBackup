const articleRouter = require('express').Router();
const { getAllArticles } = require('../controllers/articlesControllers');
const { handle405 } = require('../errors');


articleRouter.route('/')
  .get(getAllArticles)
  .all(handle405);

module.exports = articleRouter;
