// process.env.NODE_ENV = 'development';
const app = require('express')();
const bodyParser = require('body-parser');
const apiRouter = require('./routers/apiRouter');
const { handle400 } = require('./errors');

app.use(bodyParser.json());

app.use('/api', apiRouter);

app.use(handle400);
app.use((err, req, res, next) => {
  if (err) console.log('Catch all recieved ########----->', err);
});

module.exports = app;
