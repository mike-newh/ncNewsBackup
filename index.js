// process.env.NODE_ENV = 'development';
const app = require('express')();
const bodyParser = require('body-parser');
const apiRouter = require('./routers/apiRouter');
const { handleSqlErr, handle404, handle400 } = require('./errors');
const listEndpoints = require('express-list-endpoints');


app.use(bodyParser.json());

app.use((req, res, next) => {
  if (req.url === '/api' || req.url === '/api/') {
    res.status(200).json({ paths: listEndpoints(app) });
  } else next();
});

app.use('/api', apiRouter);

app.use(handleSqlErr);
app.use(handle404);
app.use(handle400);
app.use((err, req, res, next) => {
  if (err) {
    console.log('Catch all recieved ########----->', err);
    res.status(500).json({ err });
  }
});

module.exports = app;
