const connection = require('../db/connection');

exports.getAllUsers = (req, res, next) => {
  connection('users').then((users) => {
    res.status(200).json({ users });
  });
};

exports.getUserById = (req, res, next) => {
  const { user_id } = req.params;
  connection('users').where('user_id', user_id).then(([user]) => {
    if (!user) return next({ status: 404, message: 'user not found' });
    res.status(200).json({ user });
  });
};
