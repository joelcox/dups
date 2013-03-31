var assert = require('assert');
var dgram = require('dgram');
var response = require('./response');
var request = require('./request');

/**
 * Create a new server using a certain socket
 *
 * @constructor
 * @this Server
 * @api private
 */
function Server() {
  this.socket = dgram.createSocket('udp4');
  this.handlers = {};
  this.intervals = [];
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
};

/**
 * Set a callback function for a command
 *
 * @param {string} command
 * @param {function} fn Callback that will be executed when datagram with this
 * command is received
 * @api public
 */
Server.prototype.receive = function(command, fn) {
  assert.deepEqual(['string', 'number'].indexOf(typeof command) >= 0, true,
  'First argument must be a string or number');
  assert.deepEqual(typeof fn, 'function', 'Second argument must be a function');
  if (typeof this.handlers[command] !== 'undefined') {
    throw new Error('Handler already set for this command');
  }

  this.handlers[command] = {
    fn: fn
  };

};

/**
 * Set a callback function which is called every x ms
 *
 * @param {number} interval Interval between calls in ms
 * @param {function} fn Callback function
 * @api public
 */
Server.prototype.every = function(interval, fn) {
  assert.deepEqual(typeof interval, 'number', 'First argument must be a number');
  assert.deepEqual(typeof fn, 'function', 'Third argument must be a function');

  this.receive(interval, fn);
};

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

  this._addEventListeners();
  this.socket.bind(port, address);
};

/**
 * Clears the intervals for all timed handlers
 *
 * @return {number} The amount of intervals that were cleared
 * @api public
 */
Server.prototype.clearIntervals = function() {
  if (this.intervals.length === 0) return 0;
  var intervalsCleared = 0;

  this.intervals.forEach(function(value) {
    clearInterval(value);
    intervalsCleared++;
  });

  return intervalsCleared;
}

/**
 * Hooks up different events
 *
 * @api private
 */
Server.prototype._addEventListeners = function() {

  // Bind this to the functions so this is not replaced by the EventEmitter
  // object in the callback functions
  this.socket.on('listening', this._processInit.bind(this));
  this.socket.on('listening', this._startIntervals.bind(this));
  this.socket.on('message', this._processMessage.bind(this));
};

/**
 * Executed the init function if set
 *
 * @api private
 */
Server.prototype._processInit = function() {

  if (typeof this.handlers.init === 'undefined') return false;
  var res = new response.Response(this.socket, {

      // These properties should be dynamic
      address: '127.0.0.1',
      port: 8000
    }
  );

  this.handlers.init.fn(res);
};

/**
 * Filter all interval callbacks and set up the intervals
 *
 * @api private
 */
Server.prototype._startIntervals = function() {

  var that = this;
  var req = new response.Response(this.socket, {
    address: '127.0.0.1',
    port: 8000
  });

  // Check if the key is a number and set up an interval if it is.
  Object.keys(this.handlers).forEach(function(key) {
    interval = parseInt(key, 10);
    if (Number.isNaN(interval)) return;
    that.intervals.push(setInterval(that.handlers[key].fn, interval, req));
  });

};

/**
 * Handles incoming datagrams
 *
 * @param {Buffer} buffer Message buffer
 * @param {object} requestInfo Information about the incoming request
 * @api private
 */
Server.prototype._processMessage = function(buffer, requestInfo) {

  // Unpack the MsgPack buffer so we can determine the command
  req = new request.Request(buffer, requestInfo);

  // Check if there is a handler for this command
  if (typeof this.handlers[req.command] === 'undefined') {
    throw new Error('No handler for command ' + req.command);
  }

  res = new response.Response(this.socket, requestInfo);
  this.handlers[req.command].fn(req, res);
};

/**
 * Factory method for creating a new server
 *
 * @return {Server}
 * @api public
 */
module.exports.createServer = function() {
  return new Server();
};

module.exports.Server = Server;