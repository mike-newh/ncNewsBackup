const connection = require('../db/connection');


exports.getAllTopics = (req, res, next) => connection.select('*').from('topics')
  .then((topics) => {
    res.status(200).json({ topics });
  });
