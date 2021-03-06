
// 405 - Bad method - eg using a post on a get-only path
exports.handle405 = (req, res, next) => {
  res.status(405).json({ status: 405, message: 'Method not allowed' });
};

// 400 - bad request - client did something wrong in their request, generally input is wrong format
exports.handleSqlErr = (err, req, res, next) => {
  const codes = {
    42703: 400,
    23505: 422,
    23503: 404,
    '22P02': 400,
    // 23503 is arguably a 404
  };
  const messages = {
    42703: 'Bad Request',
    23505: 'Unprocessable entity (May be caused if item already exists)',
    23503: 'Page not found',
    '22P02': 'invalid input syntax',
  };
  if (codes[err.code]) {
    if (err.code === '23503' && err.constraint === 'comments_user_id_foreign') { return res.status(422).json({ err }); }
    res.status(codes[err.code]).send({ status: codes[err.code], message: messages[err.code] });
  } else if (err.code !== undefined) {
    console.log('UTRACKED SQL ERROR ########--->', err);
  } else next(err);
};

exports.handle400 = (err, req, res, next) => {
  if (err.status === 400) return res.status(400).json({ err });
  next(err);
};

exports.handle404 = (err, req, res, next) => {
  if (err.status === 404) return res.status(404).send({ err });
  next(err);
};

// || err.code === '23503')
