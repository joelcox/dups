
function Server() {
  this.handlers = {}
}

Server.prototype.receive = function(command, fn) {

  if (typeof this.handlers[command] !== 'undefined') {
    throw new Error('Handler already set for this command');
  }

  this.handlers[command] = fn;

}

module.exports.createServer = function() {
  return new Server();
}

// We also want to export Server when we're running in a test env so we
// can check the returned object from the createServer function
if (process.env.NODE_ENV === 'test') module.exports.Server = Server;