var msgpack = require('msgpack');

/**
 * Create a new request object from a datagram
 *
 * @constructor
 * @this Request
 * @param {Buffer} buffer MsgPack buffer
 * @param {Object} requestInfo Info about the sender
 * @api public
 */
function Request(buffer, requestInfo) {

  // Unpack the buffer and retrieve
  var unpacked = msgpack.unpack(buffer);
  this.data = unpacked.data;
  this.command = unpacked.command;

  // Copy some basics from the request info
  this.port = requestInfo.port;
  this.address = requestInfo.address;

}

module.exports.Request = Request;