var sys = require('sys');
var include2 = require('./include2');
module.exports = include;
function include() {
    sys.log('bing');
};
include.ted = "fred";
Object.defineProperty(include.prototype, "length", {
  get: function(){
    return "bingo";
  }
});
include.prototype = 
{
	length: new include2()
};


