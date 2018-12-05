const userRouter = require('express').Router();
const { getAllUsers, getUserById } = require('../controllers/usersControllers');
const { handle405 } = require('../errors');

userRouter.param('user_id', (req, res, next, user_id) => {
  if (Number.isInteger(+user_id) && !user_id.includes('.')) { next(); } else next({ status: 400, message: 'Invalid user id' });
});

userRouter.route('/')
  .get(getAllUsers)
  .all(handle405);

userRouter.route('/:user_id')
  .get(getUserById)
  .all(handle405);
module.exports = userRouter;
