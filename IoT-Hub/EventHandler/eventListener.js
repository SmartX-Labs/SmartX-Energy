var kafka = require('kafka-node');

const AC_MINIMUM_TEMP = 18;
const AC_MAXIMUM_TEMP = 30;
const COUNT_MAX = 1;

exports.temp = function(req, res) {
    console.log(req.query);

    var cnt = 1;

    if (req.query.temperature >= 18 && req.query.temperature <= 30) {
        var Interval = setInterval(function() {
                var HighLevelProducer = kafka.HighLevelProducer,
                    client = new kafka.Client('hub1:2181'),
                    producer = new HighLevelProducer(client);


                if (cnt > COUNT_MAX) {
                    clearInterval(Interval);
                    now_ac_temp = req.query.temperature;
                    console.log("End of Iteration");
                    res.end();
                } else {
                    console.log("[" + cnt + "]" + "AC temp set to " + req.query.temperature + "\'C");
                    var payload = [{
                        topic: 'controlAC1',
                        messages: req._parsedUrl.query
                        //messages: req.url
                    }]

                    producer.on('ready', function() {
                        producer.send(payload, function(err, data) {
                            if (err)
                                console.log(err);
                        });
                    });
                    cnt++;
                }
            },
            700);
    } else {
        res.write('Out of range');
        res.end();
    }
};
