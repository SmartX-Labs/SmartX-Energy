var express = require('express'),
    control = require('./eventListener');
var app = express();

app.put('/control/temp', control.temp);

app.listen(4000, () => {
  console.log('Listening on port 4000...');
});
