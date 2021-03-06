var dups = require('../lib/server');
var response = require('../lib/response');
var request = require('../lib/request');
var stream = require('stream');
var msgpack = require('msgpack');
var EventEmitter = require('events').EventEmitter;

describe('A server', function() {

  var server;

  beforeEach(function() {
    server = new dups.Server();

    // Create mock for the socket
    var mockSocket = new stream.Stream();
    mockSocket.bind = function() {};
    mockSocket.send = function() {};
    spyOn(mockSocket, 'bind');
    spyOn(mockSocket, 'send');
    server.socket = mockSocket;
  });

  it('can be initiated using a factory function', function() {
    expect(dups.createServer() instanceof dups.Server).toEqual(true);
  });

  it('can be inititated using a constructor', function() {
    expect(server instanceof dups.Server).toEqual(true);
  });

	it('has an object literal for handlers', function() {
		expect(Object.keys(server.handlers).length).toEqual(0);
	});

  describe('has socket property that', function() {

    it('is inheritted from EventEmitter', function() {
      expect(server.socket instanceof EventEmitter).toEqual(true);
    });

  });

  describe('has a receive method that', function() {

    it('allows you to associate a command with a handler', function() {
      server.receive('greet', function() {});

      expect(Object.keys(server.handlers).length).toEqual(1);
      expect(typeof server.handlers.greet.fn).toEqual('function');
    });

    it('throws an error when trying to overwriting a handler', function() {
      server.receive('greet', function() {});

      var fn = function() {
        server.receive('greet', function() {});
      };

      expect(fn).toThrow('Handler already set for this command');
    });

    it('is executed after a specific command is received', function() {
      var receiveCallback = createSpy('receive callback function');
      server.receive('join', receiveCallback);
      server.bind(8000);

      // Manually emit a message event so we the init function is called.
      server.socket.emit('message', msgpack.pack(['join']), {
        address: '127.0.0.1',
        port: 8000
      });

      // This is nasty. Don't have docs on hand (offline), so fix this later.
      setTimeout(function() {
        expect(receiveCallback).toHaveBeenCalled();
      }, 10);

    });

    it('throws an exception if there\'s no handler for a command', function() {

      // Start the server and manually emit a message
      var fn =  function() {
        server.bind(8000);
        server.socket.emit('message', msgpack.pack(['join']), {
          address: '127.0.0.1',
          port: 8000
        });

      };

      expect(fn).toThrow('No handler for command join');

    });

  });

  describe('has a bind method that', function() {

    it('allows you to set a port', function() {
      server.bind(8000);

      expect(server.port).toEqual(8000);
      expect(server.address).toEqual('localhost');
      expect(server.socket.bind).toHaveBeenCalled();
      expect(server.socket.bind.mostRecentCall.args)
        .toEqual([8000, undefined]);

    });

    it('allows you to set a port and address', function() {
      server.bind(8000, '127.0.0.1');

      expect(server.port).toEqual(8000);
      expect(server.address).toEqual('127.0.0.1');
      expect(server.socket.bind).toHaveBeenCalled();
      expect(server.socket.bind.mostRecentCall.args)
        .toEqual([8000, '127.0.0.1']);
    });

  });

  describe('has an init method that', function() {

    it('allows you to pass a initialization function', function() {
      server.init(function(response) { });
      expect(typeof server.handlers.init.fn).toEqual('function');
    });

    it('is executed after the server in bound', function() {
      var initCallback = createSpy('init callback function');
      server.init(initCallback);
      server.bind(8000);

      // Manually emit a listening even so we the init function is called.
      server.socket.emit('listening');

      // This is nasty. Don't have docs on hand (offline), so fix this later.
      setTimeout(function() {
        expect(initCallback).toHaveBeenCalled();
      }, 10);

    });

    it('isn\'t executed if it isn\'t set', function() {
      expect(server._processInit()).toEqual(false);
    });

  });

  describe('has a every method that', function() {

    it('allows you to set a callback function', function() {
      server.every(2000, function() { });
      expect(typeof server.handlers['2000']).toEqual('object');
      expect(typeof server.handlers['2000'].fn).toEqual('function');
    });

  });

  describe('has a startIntervals method that', function () {

    it('creates intervals for interval commands', function(done) {
      var joinNetworkCallback = createSpy('join network function');
      server.every(500, joinNetworkCallback);
      server._startIntervals();

      setTimeout(function() {
        expect(joinNetworkCallback.callCount).toEqual(2);
        done();
        server.clearIntervals();
      }, 1010);

    });

    it ('doesn\'t create intervals for non-interval commands', function(done) {
      var joinNetworkCallback = createSpy('join network function');
      server.receive('join', joinNetworkCallback);
      server._startIntervals();

      setTimeout(function() {
        expect(joinNetworkCallback.callCount).toEqual(0);
        done();
        server.clearIntervals();
      }, 1010);
    });

  });

  describe('has a clearIntervals method that', function() {

    it('returns 0 if there are no intervals to clear', function() {
      expect(server.clearIntervals()).toEqual(0);
    });

    it('return the amount of intervals cleared', function() {
      server.every(1000, function() {});
      server.every(5000, function() {});
      server._startIntervals();

      expect(server.clearIntervals()).toEqual(2);
    });

  });

});