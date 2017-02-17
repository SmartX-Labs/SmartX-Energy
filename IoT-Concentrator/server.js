var coap = require('coap'),
    server = coap.createServer();
//var lirc_node = require('lirc_node'); //lirc module


// the default CoAP port is 5683
server.on('request', function(req, res) {
    var query = require('url').parse(req.url).query;
    const queryString = require('query-string').parse(query);

    console.log(queryString);
    console.log(queryString.name);
    console.log(queryString.temperature);
    console.log(queryString.direction);

    /*
lirc_node.irsend.send_once("2nd_server", "KEY_"+req.query.tempArrow+"_"+temp, function() {
console.log("a/c temp_up Command");
});
*/

    res.end()
}).listen();
