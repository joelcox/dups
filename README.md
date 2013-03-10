Dups
====

A little abstraction layer for writing UDP based services.

[![Build Status](https://travis-ci.org/joelcox/dups.png?branch=develop)](https://travis-ci.org/joelcox/dups)

Example
-------

*Note: Broadcast and timed messages have yet to be implemented.*
    
    var dups = require('dups');
    var server = dups.createServer();
    
    server.init(function(response) {
        response.setBroadcast(true);
        response.send('join', {'name': 'joel'});
    });
    
    server.receive('join', function(request, response) {
        console.log(request.data.name + ' wants to join');
    });
    
    server.receive('ping', function(request, response) {
        response.send('pong');
    });
    
    server.every(10000, function(response) {
        response.setBroadcast(true);
        response.send('ping');
    });
    
    server.bind(8000);