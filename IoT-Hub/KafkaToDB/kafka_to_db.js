const influx = require('influx')
var kafka = require('kafka-node');

// Temp
// InfluxDB - Temp
var tempDB = new influx.InfluxDB({
    // single-host configuration
    host: 'hub1',
    port: 8086, // optional, default 8086
    protocol: 'http', // optional, default 'http'
    username: 'admin',
    password: 'admin',
    database: 'senics'
});


// Kafka - Temp
var tempKafka = new kafka.Client('hub1:2181');
var tempOffset = new kafka.Offset(tempKafka);

tempOffset.fetch([{
        topic: 'temp',
        partition: 0,
        time: -1,
        maxNum: 1
    },
    {
        topic: 'temp',
        partition: 1,
        time: -1,
        maxNum: 1
    },
    {
        topic: 'temp',
        partition: 2,
        time: -1,
        maxNum: 1
    }
], function(err, data) {

    var tempConsumer = new kafka.Consumer(tempKafka, [{
            topic: 'temp',
            partition: 0,
            offset: data['temp'][0][0]
        },
        {
            topic: 'temp',
            partition: 1,
            offset: data['temp'][1][0]
        },
        {
            topic: 'temp',
            partition: 2,
            offset: data['temp'][2][0]
        }
    ], {
        autoCommit: false,
        fromOffset: true
    });

    tempConsumer.on('message', function(message) {

        var str = String(message.value).split(',');

        var id = parseInt(str[1]);
        var humidity = parseFloat(str[2]);
        var temperature = parseFloat(str[3]);
        console.log(str);
        //console.log(id);
        //console.log(humidity);
        //console.log(temperature);
        tempDB.writePoints([{
            measurement: 'temp',
            tags: {
                id: id
            },
            fields: {
                humidity: humidity,
                temperature: temperature
            },
        }])
    });

});


var resourceKafka = new kafka.Client('hub1:2181');
var resourceOffset = new kafka.Offset(resourceKafka);

resourceOffset.fetch([{
        topic: 'resource',
        partition: 0,
        time: -1,
        maxNum: 1
    },
    {
        topic: 'resource',
        partition: 1,
        time: -1,
        maxNum: 1
    },
    {
        topic: 'resource',
        partition: 2,
        time: -1,
        maxNum: 1
    }
], function(err, data) {

    //console.log(data);
    var resourceConsumer = new kafka.Consumer(resourceKafka, [{
            topic: 'resource',
            partition: 0,
            offset: data['resource'][0][0]
        },
        {
            topic: 'resource',
            partition: 1,
            offset: data['resource'][1][0]
        },
        {
            topic: 'resource',
            partition: 2,
            offset: data['resource'][2][0]
        }
    ], {
        autoCommit: false,
        fromOffset: true
    });

    resourceConsumer.on('message', function(message) {

        console.log(message.value);

        var messageJSON = JSON.parse(message.value);

        tempDB.writePoints([{
            measurement: 'resource',
            tags: {
                ip: messageJSON.ip,
                deviceId: messageJSON.deviceId,
                timestamp: messageJSON.timestamp,
                cp: messageJSON.cp
            },
            fields: {
                memory: messageJSON.memory,
                tx: messageJSON.tx,
                rx: messageJSON.rx,
                cpu: messageJSON.cpu,
                txDropped: messageJSON.txDropped,
                rxError: messageJSON.rxError,
                disk: messageJSON.disk,
                rxDropped: messageJSON.rxDropped,
                txError: messageJSON.txError
            },
        }])

    });

});
