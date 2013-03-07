var assert = require('assert');
var msgpack = require('msgpack');

/**
 * Create a new response from a socket and info from the incoming request
 *
 * @constructor
 * @this Request
 * @param {Socket} socket Bound by the Server
 * @param {object} requestInfo Information about the incoming request
 * @api public
 */
function Response(socket, requestInfo) {
  this.socket = socket;
  this.address = requestInfo.address;
  this.port = requestInfo.port;
}

Response.prototype.send = function(command, data) {
  assert.deepEqual(typeof command, 'string', 'First argument must be a string');
  if (typeof data !== 'undefined') {
    assert.deepEqual(typeof data, 'object', 'Second argument must be an object');
  }

  this.socket.write(msgpack.pack([command, data]));
}

module.exports.Response = Response;