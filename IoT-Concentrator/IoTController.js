var kafka = require('kafka-node');
var coap = require('coap')

const controlAgentIp = 'senics';

var Kafka = new kafka.Client('hub1:2181');
var Offset = new kafka.Offset(Kafka);

Offset.fetch([{
    topic: 'controlAC1',
    partition: 0,
    time: -1,
    maxNum: 1
},
{
    topic: 'controlAC1',
    partition: 1,
    time: -1,
    maxNum: 1
},
{
    topic: 'controlAC1',
    partition: 2,
    time: -1,
    maxNum: 1
}
], function(err, data) {
var Consumer = new kafka.Consumer(Kafka, [{
        topic: 'controlAC1',
        partition: 0,
        offset: data['controlAC1'][0][0]
    },
    {
        topic: 'controlAC1',
        partition: 1,
        offset: data['controlAC1'][1][0]
    },
    {
        topic: 'controlAC1',
        partition: 2,
        offset: data['controlAC1'][2][0]
    }
], {
    autoCommit: false,
    fromOffset: true
});

Consumer.on('message', function(message) {
    var controlMsg = message.value;
    console.log(controlMsg);

    // the default CoAP port is 5683
    var req = coap.request({
        host: controlAgentIp,
        query: controlMsg,
        method: 'PUT'
    })

console.log(req.url);
    req.on('response', function(res) {
        res.pipe(process.stdout)
//	console.log(res);
        //res.on('end', function() {})



})

req.end()

});
});
