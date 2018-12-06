const articleRouter = require('express').Router();
const {
  getArticleById, getAllArticles, patchArticleById, delArticleById, getCommentsByArticle, postCommentToArticle, patchCommentById, deleteComment,
} = require('../controllers/articlesControllers');
const { handle405 } = require('../errors');


articleRouter.param('article_id', (req, res, next, article_id) => {
  if (Number.isInteger(+article_id) && !article_id.includes('.')) { next(); } else next({ status: 400, message: 'Invalid article id' });
});


articleRouter.route('/')
  .get(getAllArticles)
  .all(handle405);

articleRouter.route('/:article_id')
  .get(getArticleById)
  .patch(patchArticleById)
  .delete(delArticleById)
  .all(handle405);

articleRouter.route('/:article_id/comments')
  .get(getCommentsByArticle)
  .post(postCommentToArticle)
  .all(handle405);

articleRouter.route('/:article_id/comments/:comment_id')
  .patch(patchCommentById)
  .delete(deleteComment)
  .all(handle405);
module.exports = articleRouter;
