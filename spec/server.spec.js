var Dups = require('../lib');


describe('A server', function() {

	it('must be initiated using new', function() {
    var fn = function() {
      Dups.Server();
    }

		expect(fn).toThrow('Must be initiated using new');
	});

	it('has a object literal containing for handlers', function() {
		var server = new Dups.Server();
		expect(Object.keys(server.handlers).length).toEqual(0);
	});

  describe('has a method receive', function() {

    var server = new Dups.Server();
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