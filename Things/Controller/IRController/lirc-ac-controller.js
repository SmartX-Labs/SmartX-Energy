/**
 * Created by k on 2017-02-17.
 */
const REMOTE_NAME = "ServerRoom_AC1";

var lirc_node = require('lirc_node'); //lirc module

//lirc서비스 초기화 함수
exports.initLircService = function (){
    lirc_node.init();
}

//인자 : 온도 ("18" to "27")
exports.setTemp = function (target_temp){
    var command = "SET_"+ target_temp;
    console.log(command);
    lirc_node.irsend.send_once(REMOTE_NAME, command, function() {
        console.log("Set AC Temp to" + target_temp);
    });
}

//인자 : 전원ON => "ON" ;  전원OFF => "OFF"
exports.setPower = function (target_state){
    var command = "POWER_"+ target_state;
    console.log(command);
    lirc_node.irsend.send_once(REMOTE_NAME, command, function() {
        console.log("AC Power " + target_state);
    });
}