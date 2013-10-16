var net = require('net');
var EventEmitter = require('events').EventEmitter;
var stream = require('stream');

var settings = {
	MESSAGE_SEPARATOR: 30, // ascii record separator code
	SEND_BUFFER_SIZE: 42 * 1024
};

var streamSplitter = new stream.Transform( { objectMode: true } );

streamSplitter._transform = function (chunk, encoding, done) {
	this._buffer = this._buffer || new Buffer(0);
	this._offset = this._offset || 0;

	this._buffer = Buffer.concat([this._buffer, new Buffer(chunk)]);

	for(var offset = this._offset, l = this._buffer.length; offset < l; offset++ ) {
		if ( this._buffer[offset] === settings.MESSAGE_SEPARATOR ) {
			this.push(this._buffer.toString('ascii', this._offset !== 0 ? this._offset + 1 : 0, offset));
			this._offset = offset;
		}
	}

	if ( this._offset !== 0){
		this._buffer = this._buffer.slice(this._offset + 1);
		this._offset = 0;
	}

    done();
};

streamSplitter._flush = function (done) {
	if (this._buffer && this._buffer.length > 0) {
		this.push(this._buffer.toString('ascii'));
	}
	this._buffer = null;
	done();
};

var messageConcater = new stream.Transform();

messageConcater._transform = function (chunk, encoding, done) {
	this._buffer = this._buffer || new Buffer(0);
	if (chunk.toString('ascii').indexOf(String.fromCharCode(settings.MESSAGE_SEPPARATOR)) !== -1){
		return;
	}

	this._buffer = Buffer.concat([this._buffer, chunk, new Buffer([settings.MESSAGE_SEPARATOR])]);

	if ( this._buffer.length >= settings.SEND_BUFFER_SIZE ){
		this.push(this._buffer);
		this._buffer = new Buffer(0);
	}

    done();
};

messageConcater._flush = function (done) {

	if (this._buffer && this._buffer.length > 0) {
		this.push(this._buffer);
	}
	this._buffer = null;
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

