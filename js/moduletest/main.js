var sys = require("sys");
var test = require('./include');
sys.log(test.ted);
sys.log(test.prototype.length);
test();
var newtest = new test();
sys.log(newtest.length);
