
// 405 - Bad method - eg using a post on a get-only path
exports.handle405 = (req, res, next) => {
  res.status(405).json({ status: 405, message: 'Method not allowed' });
};

// 400 - bad request - client did something wrong in their request, generally input is wrong format
exports.handle400 = (err, req, res, next) => {
  const codes = {
    42703: 400,

  };
  const messages = {
    42703: 'Bad Request',
  };
  if (codes[err.code]) {
    res.status(codes[err.code]).send({ status: codes[err.code], message: messages[err.code] });
  } else if (err.status === 400) {
    res.status(400).json(err);
  } else next(err);
};

exports.handle404 = (err, req, res, next) => {
  if (err.status === 404 || err.code === '23503') res.status(404).send({ err });
};
