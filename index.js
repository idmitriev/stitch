var net = require('net');
var EventEmitter = require('events').EventEmitter;
var stream = require('stream');

var settings = {
	MESSAGE_SEPARATOR: 30, // ascii record separator code
};

var streamSplitter = new stream.Transform( { objectMode: true } );

streamSplitter._transform = function (chunk, encoding, done) {
	this._buffer = this._buffer || new Buffer(0);
	this._offset = this._offset || 0;

	this._buffer = Buffer.concat([this._buffer, new Buffer(chunk)]);

	for(var offset = this._offset, l = this._buffer.length; offset < l; offset++ ) {
		if ( this._buffer[offset] === settings.MESSAGE_SEPARATOR ) {
			this.push(this._buffer.toString('ascii', this._offset, offset));
			this._offset = offset + 1;
		}
	}

	if ( this._offset !== 0){
		this._buffer = this._buffer.slice(this._offset);
		this._offset = 0;
	}

    done();
};

var messageConcater = new stream.Transform();

messageConcater._transform = function (chunk, encoding, done) {
	this._buffer = this._buffer || new Buffer(0);
	if (chunk.toString('ascii').indexOf(String.fromCharCode(settings.MESSAGE_SEPPARATOR)) !== -1){
		return;
	}

	//TODO output buffering
	this.push(Buffer.concat([chunk, new Buffer([settings.MESSAGE_SEPARATOR])]));

    done();
};

module.exports.createServer = function(messageListener){
	var server = net.createServer();
	server.on('connection', function(socket){
		socket.setEncoding('ascii');
		messageListener(socket.pipe(streamSplitter));
	});
	return server;
};

module.exports.connect = function(host, port, messageStream){
	var socket = net.connect({port: port, host: host}, function(){
		messageStream.pipe(messageConcater).pipe(socket);
	});

	return socket;
};

