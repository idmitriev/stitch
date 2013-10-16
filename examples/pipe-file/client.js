var stitch = require('../../');
var stream = require('stream');

var liner = new stream.Transform( { objectMode: true, highWaterMark: 0 } );
liner._transform = function (chunk, encoding, done) {
	var self = this;
     var data = chunk.toString();
     if (this._lastLineData) data = this._lastLineData + data;
 
     var lines = data.split('\n');
     this._lastLineData = lines.splice(lines.length-1,1)[0];
 
     lines.forEach(function(line){
		self.push(line + '\n');
     });
     done();
};

liner._flush = function (done) {
     if (this._lastLineData && this._lastLineData.length > 0) this.push(this._lastLineData);
     this._lastLineData = null;
     done();
};

stitch.connect('localhost', 1234, process.stdin.pipe(liner));
