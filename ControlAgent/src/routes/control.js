const AC_MINIMUM_TEMP = 18;
const AC_MAXIMUM_TEMP = 30;
const RETRIES_NUM = 1;

var now_ac_temp;

var lirc_node = require('lirc_node'); //lirc module

exports.temp = function(req, res) {
    console.log("[Put]control/temp-targetTemp:" + req.query.temp);
    console.log("[Put]control/temp-tempArrow:" + req.query.tempArrow);

    var cnt = 1;

    if (req.query.temp >= 18 && req.query.temp <= 30) {
        var Interval = setInterval(function() {
            console.log("[" + cnt + "]" + "now_ac_temp is up to " + req.query.temp);
            if (cnt >= RETRIES_NUM) {
                clearInterval(Interval);
                now_ac_temp = req.query.temp;
                //res.write(now_ac_temp + '');
                res.end();
            } else {
                /*
                  lirc_node.irsend.send_once("2nd_server", "KEY_"+req.query.tempArrow+"_"+temp, function() {
                  console.log("a/c temp_up Command");
                  });
                */
                cnt++;
            }
        }, 700);
    } else {
        res.write('Out of range');
        res.end();
    }
};
