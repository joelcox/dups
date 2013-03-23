var msgpack = require('msgpack');
var request = require('../lib/request.js');

describe('A request', function() {

  var req;

  beforeEach(function() {
    req = new request.Request(msgpack.pack([
      'join', {
        'foo': 'bar',
        'spam': 'eggs'
        }
      ]), {
        'port': 8000,
        'address': '127.0.0.1'
      }
    );
  });

  it('has a command attribute', function() {
    expect(req.command).toEqual('join');
  });

  it('has a data attribute', function() {
    expect(req.data).toEqual({
      'foo': 'bar',
      'spam': 'eggs'
    });
  });

  it('has an address attribute', function() {
    expect(req.address).toEqual('127.0.0.1');
  });

  it('has a port attribute', function() {
    expect(req.port).toEqual(8000);
  });

});