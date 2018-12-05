const apiRouter = require('express').Router();
const topicRouter = require('./topicRouter');
const articleRouter = require('./articleRouter');
const userRouter = require('./userRouter');


apiRouter.use('/topics', topicRouter);
apiRouter.use('/articles', articleRouter);
apiRouter.use('/users', userRouter);


// apiRouter.get('/', getApiEndpoints);

module.exports = apiRouter;
