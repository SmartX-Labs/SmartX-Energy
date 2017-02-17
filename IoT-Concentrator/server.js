var coap = require('coap'),
    server = coap.createServer();

//var lircAcController = require('./lirc-ac-controller.js');
//lircAcController.initLircService();


// the default CoAP port is 5683
server.on('request', function(req, res) {
    var query = require('url').parse(req.url).query;
    const queryString = require('query-string').parse(query);
    console.log(queryString);
  //  lircAcController.setTemp(queryString.temperature);

    res.end()
}).listen();
