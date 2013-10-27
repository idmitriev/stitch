var stitch = require('../../');
var Readable = require('stream').Readable;

var messageStream = new Readable();
messageStream._read = function(){
	messageStream.push('message1');
	messageStream.push('message2');
	messageStream.push('message3');
	messageStream.push(null);
};

stitch.connect('localhost', 1234, messageStream);




