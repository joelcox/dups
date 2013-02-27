var response = require('../lib/response.js');
var msgpack = require('msgpack');
var stream = require('stream');

describe('A response', function() {

  var res;
  var mockSocket;

  beforeEach(function () {
    mockSocket = new stream.Stream();
    mockSocket.write = function() {}
    spyOn(mockSocket, 'write');

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

  describe('has a send method', function() {

    it('that allows you to set a command', function() {
      res.send('ping');
      var packed = msgpack.pack(['ping', undefined]);
      
      expect(res.socket.write).toHaveBeenCalled();
      expect(res.socket.write.mostRecentCall.args)
        .toEqual([packed]);
    });

    it('that allows you to set a command and data', function() {
      res.send('ping', {hostname: 'mbp.local'});
      var packed = msgpack.pack(['ping', {hostname: 'mbp.local'}]);

      expect(res.socket.write).toHaveBeenCalled();
      expect(res.socket.write.mostRecentCall.args)
        .toEqual([packed]);

    })

  });

});