var stitch = require('../../');

stitch.createServer(function(messageStream){
	messageStream.pipe(process.stdout);
}).listen(1234, '0.0.0.0', function(){
	console.log('listening');
});


