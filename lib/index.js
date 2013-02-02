
function Server() {

  if ( ! (this instanceof Server)) {
    throw new Error('Must be initiated using new');
  }

  this.handlers = {}
}

Server.prototype.receive = function(command, fn) {

  if (typeof this.handlers[command] !== 'undefined') {
    throw new Error('Handler already set for this command');
  }

  this.handlers[command] = fn;

}

module.exports.Server = Server;