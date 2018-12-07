const app = require('./index.js');

const { PORT = 9090 } = process.env;

app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log('listening');
});
