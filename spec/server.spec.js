var dups = require('../lib');


describe('A server', function() {

  it('is initiated using the factory function', function() {
    var server = dups.createServer();
    expect(server instanceof dups.Server).toEqual(true);
  });

	it('has a object literal for handlers', function() {
		var server = dups.createServer();
		expect(Object.keys(server.handlers).length).toEqual(0);
	});

  describe('has a receive method that', function() {

    var server = dups.createServer();
    server.receive('greet', function testHandler() {
      return;
    });

    it('allows you to associate a command with a handler', function() {
      expect(Object.keys(server.handlers).length).toEqual(1);
      expect(typeof server.handlers.greet).toEqual('function');
    });

    it('throws an error when trying to overwriting a handler', function() {
      var fn = function() {
        server.receive('greet', function() {
          return true;
        });
      }

      expect(fn).toThrow('Handler already set for this command');
    });

  });

});