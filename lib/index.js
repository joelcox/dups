var assert = require('assert');
var dgram = require('dgram');

function Server(socket) {
  this.socket = socket;
  this.handlers = {}
}

Server.prototype.receive = function(command, fn) {
  assert.deepEqual(typeof command, 'string', 'First argument must be a string');
  assert.deepEqual(typeof fn, 'function', 'Second argument must be a function');

  if (typeof this.handlers[command] !== 'undefined') {
    throw new Error('Handler already set for this command');
  }

  this.handlers[command] = fn;

}

Server.prototype.bind = function(port, address) {
  assert.deepEqual(typeof port, 'number', 'First argument must be an integer');

  this.port = port;
  this.address = address || 'localhost';

  this.socket.bind(port, address);
  this._bootstrap();
}

Server.prototype.init = function(fn) {
  assert.deepEqual(typeof fn, 'function', 'First argument must be a function');
  this.receive('init', fn);
}

Server.prototype._bootstrap = function() {
  // Run the init function when the socket is ready
  this.socket.on('start', this._runInit);
}

Server.prototype._runInit = function() {
  if (typeof this.init !== 'undefined') this.init();
  else return false;
}

module.exports.createServer = function() {
  var socket = dgram.createSocket('udp4');
  return new Server(socket);
}

// We also want to export Server when we're running in a test env so we
// can check the returned object from the createServer function
if (process.env.NODE_ENV === 'test') module.exports.Server = Server;