var stitch = require('../../');

stitch.createServer(function(messageStream){
	messageStream.on('data', function(message){
		console.log('message received: ' + message);
	});
}).listen(1234, '0.0.0.0', function(){
	console.log('listening');
});


