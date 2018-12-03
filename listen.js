const app = require('./index.js');


app.listen(9090, (err) => {
  if (err) console.log(err);
  else console.log('listening');
});
