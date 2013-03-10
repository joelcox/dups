var response = require('../lib/response.js');
var msgpack = require('msgpack');
var stream = require('stream');
var EventEmitter = require('events').EventEmitter;

describe('A response', function() {

  var res;

  beforeEach(function () {
    var mockSocket = new stream.Stream();
    mockSocket.send = function() {}
    spyOn(mockSocket, 'send');

    res = new response.Response(mockSocket, {
      address: '127.0.0.1',
      port: 8000,
    });
  });

  it('has an address attribute', function() {
    expect(res.address).toEqual('127.0.0.1');
  });

  it('has an port attribute', function() {
    expect(res.port).toEqual(8000);
  });

  describe('has socket property that', function() {

    it('is inheritted from EventEmitter', function() {
      expect(res.socket instanceof EventEmitter).toEqual(true);
    });

  });

  describe('has a send method', function() {

    it('that allows you to set a command', function() {
      res.send('ping');
      var packed = msgpack.pack(['ping', undefined]);

      expect(res.socket.send).toHaveBeenCalled();
      expect(res.socket.send.mostRecentCall.args)
        .toEqual([packed, 0, packed.length, 8000, '127.0.0.1']);
    });

    it('that allows you to set a command and data', function() {
      res.send('ping', {hostname: 'mbp.local'});
      var packed = msgpack.pack(['ping', {hostname: 'mbp.local'}]);

      expect(res.socket.send).toHaveBeenCalled();
      expect(res.socket.send.mostRecentCall.args)
        .toEqual([packed, 0, packed.length, 8000, '127.0.0.1']);
    })

  });

});