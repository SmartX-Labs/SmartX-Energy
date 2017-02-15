var express = require('express'),
    control = require('./routes/control');
var app = express();

app.put('/control/temp', control.temp);

app.listen(3000, () => {
  console.log('Listening on port 3000...');
});
