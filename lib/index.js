var assert = require('assert');
var dgram = require('dgram');
var response = require('./response.js');
var request = require('./request.js');

/**
 * Create a new server using a certain socket
 *
 * @constructor
 * @this Server
 * @param {Socket} socket
 * @api private
 */
function Server(socket, response, request) {
  this.socket = socket;
  this.Response = response;
  this.Request = request;
  this.handlers = {}
}

/**
 * Set a callback function for a command
 *
 * @param {string} command
 * @param {function} fn Callback that will be executed when datagram with this
 * command is received
 * @api public
 */
Server.prototype.receive = function(command, fn) {
  assert.deepEqual(typeof command, 'string', 'First argument must be a string');
  assert.deepEqual(typeof fn, 'function', 'Second argument must be a function');

  if (typeof this.handlers[command] !== 'undefined') {
    throw new Error('Handler already set for this command');
  }

  this.handlers[command] = fn;

}

/**
 * Binds a server to a port and address
 *
 * @param {number} port
 * @param {string} address Host or IP address
 * @api public
 */
Server.prototype.bind = function(port, address) {
  assert.deepEqual(typeof port, 'number', 'First argument must be an integer');

  this.port = port;
  this.address = address || 'localhost';

  this.socket.bind(port, address);
  this._bootstrap();
}

/**
 * Set a callback which will be executed when the socket is successfully
 * bound to the port
 *
 * @param {function} fn Callback function
 * @api public
 */
Server.prototype.init = function(fn) {
  assert.deepEqual(typeof fn, 'function', 'First argument must be a function');
  this.receive('init', fn);
}

/**
 * Hooks up different events
 *
 * @api private
 */
Server.prototype._bootstrap = function() {

  // Bind this to the functions so this is not replaced by the EventEmitter
  // object in the callback functions
  this.socket.on('listening', this._runInit.bind(this));
  this.socket.on('message', this._processMessage.bind(this));
}

/**
 * Executed the init function if set
 *
 * @api private
 */
Server.prototype._runInit = function() {

  if (typeof this.handlers.init === 'undefined') return false;
  var res = new this.Response(this.socket, {

      // These properties should be dynamic
      address: '127.0.0.1',
      port: 8000,
    }
  );

  this.handlers.init(res);
}

/**
 * Handles incoming datagrams
 *
 * @param {Buffer} buffer Message buffer
 * @param {object} requestInfo Information about the incoming request
 * @api private
 */
Server.prototype._processMessage = function(buffer, requestInfo) {

  // Unpack the MsgPack buffer so we can determine the command
  req = new this.Request(buffer, requestInfo);

  // Check if there is a handler for this command
  if (typeof this.handlers[req.command] === 'undefined') {
    throw new Error('No handler for command ' + req.command);
  }

  res = new this.Response(this.socket, requestInfo);
  this.handlers[req.command](req, res);
}

/**
 * Factory method for creating a new server
 *
 * @return {Server}
 * @api public
 */
module.exports.createServer = function() {
  var socket = dgram.createSocket('udp4');
  return new Server(socket);
}

// We also want to export Server when we're running in a test env so we
// can check the returned object from the createServer function
if (process.env.NODE_ENV === 'test') module.exports.Server = Server;