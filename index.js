process.env.NODE_ENV = 'development';
const app = require('express')();
const bodyParser = require('body-parser');
const apiRouter = require('./routers/apiRouter');

app.use(bodyParser.json());

app.use('/api', apiRouter);

app.use((err, req, res, next) => {
  if (err) console.log(err);
});

module.exports = app;
