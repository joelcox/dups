Dups
====

A nice abstraction layer for writing UDP based applications.

Example
-------
    
    var dups = require('dups');
    var server = dups.createServer();
    
    server.init(function(response) {
        response.setBroadcast(true);
        response.write('join');
    });
    
    server.receive('join', function(request, response) {
        response.write('welcome', {'name': request.params.hostname});
    });
    
    server.receive('pong', function(request, response) {
        response.write('pong');
    });
    
    server.every(10000, function(response) {
        response.setBroadcast(true);
        response.write('ping');
    });
    
    server.bind(8000);