var msgpack = require('msgpack');

/**
 * Create a new request object from a datagram
 *
 * @param {Buffer} buffer MsgPack buffer
 * @param {Object} rinfo Info about the sender
 * @api public
 */
function Request(buffer, request) {

  // Unpack the buffer and retrieve
  var unpacked = msgpack.unpack(buffer);
  this.data = unpacked.data;
  this.command = unpacked.command;

  // Copy some basics from the request info
  this.port = request.port;
  this.address = request.address;

}

module.exports.Request = Request;