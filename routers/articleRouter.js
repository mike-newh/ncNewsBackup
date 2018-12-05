const articleRouter = require('express').Router();
const { getAllArticles, patchArticleById, delArticleById } = require('../controllers/articlesControllers');
const { handle405 } = require('../errors');


articleRouter.param('article_id', (req, res, next, article_id) => {
  if (Number.isInteger(+article_id) && !article_id.includes('.')) { next(); } else next({ status: 400, message: 'Invalid article id' });
});


articleRouter.route('/')
  .get(getAllArticles)
  .all(handle405);

articleRouter.route('/:article_id')
  .patch(patchArticleById)
  .delete(delArticleById)
  .all(handle405);

module.exports = articleRouter;
