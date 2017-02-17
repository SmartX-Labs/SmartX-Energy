//How to use it

var lircAcController = require('./lirc-ac-controller.js');

lircAcController.initLircService();
lircAcController.setPower("ON");
lircAcController.setTemp("18");
