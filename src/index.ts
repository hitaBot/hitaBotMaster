/// <reference path="../typings/tsd.d.ts" />

var config = require('./config');
var server = require('./server');

// If getting a config fails, We should fall back to an interactive prompt to create a config.
config.getConfig().then(function() {
	server.StartServer();
});