/// <reference path="../typings/tsd.d.ts" />

import * as express from 'express';
import * as http from 'http';
import * as socketio from 'socket.io';
import * as config from './config';
import * as hitbox from './hitbox/hitbox'
import * as db from './database/mysql'

import * as Channel from './database/models/channel';

var cfg = config.default;

var app = express();
var server = http.createServer(app);
var io = socketio.listen(server);
var secretKey = cfg.secret;
var slaveSockets = [];
//export var channels = new Map();

io.set('transports', ['websocket']);

export function StartServer() {
	server.listen(7080);
	io.sockets.on('connection', function(socket) {
		SetSocketTimeout(socket);
		socket.emit('master',
			{
				params: {
					clients: io.sockets.clients.length,
					slaveServers: slaveSockets.length
				}
			});
		
		// Slave Server is asking to be notified for a bot
		socket.on('register', function(msg) {
			if (has(slaveSockets, msg.slave)) {
				DuplicateSlaveName(socket);
				return;
			}
			console.log('Got register message, slave: ' + msg.slave);
			if (!(msg.secret === secretKey)) {
				IncorrectSecret(socket);
				return;
			}
			RegisterSlave(socket, msg);
		});

		socket.on('disconnect', function() {
			console.log("A client has disconnected.");
			socket.get('name', function(err, name) {
				delete slaveSockets[name]
			});
		});

		socket.on('ackMsg', function(msg) {
			// Slave is telling us we successfully joined a channel.
			// SET CHANNEL HERE
			Channel.CreateChannel(msg.channel);
			Channel.SetActive(msg.channel, 1);
			if (hitbox.attemptingToJoin.has(msg.channel)) {
				hitbox.attemptingToJoin.delete(msg.channel);
			}
		});

		socket.on('rstMsg', function(msg) {
			// Slave is telling us we lost or left a channel.
			Channel.HasChannel(msg.channel).then(function(channel) {
				if (channel != null) {
					Channel.SetActive(msg.channel, 0);
				}

			})
			//if (HasChannelDB(msg.channel)) {
			//	SetInactiveChannel(msg.channel);
			//}
		});

	});

	console.log('Socket.IO started on port 7080');

	console.log('Starting hitbox socket connections.');
	hitbox.StartClients();
}

function hasBot(array: Array<any>, checkBot: string) {
	for (var element of array) {
		if (element.bot.toLowerCase() === checkBot.toLowerCase()) {
			return true;
		} else {
			return false;
		}
	};
}
function has(array, value) {
	for (var element in array) {
		if (element.toLowerCase() === value.toLowerCase()) {
			return true;
		} else {
			return false;
		}
	};
}

export function SendJoinToSlave(channel, bot, auth) {
	RandomSocket().emit('joinChannel', { channel: channel, bot: bot, auth: auth })
}

function RandomSocket(): socketio.Socket {
	var keys = Object.keys(slaveSockets);
	return slaveSockets[keys[Math.floor(keys.length * Math.random())]];
}

function SetSocketTimeout(socket) {
	setTimeout(function() {
		socket.get('authed', function(err, name) {
			if (name === true) {
				console.log('Slave is authed.');
				return;
			}
			socket.emit('infoMsg', {
				success: false,
				auth: false,
				msg: 'Slave did not auth within 10 seconds.'
			});
			socket.disconnect();
		})
	}, 10000);
}

function DuplicateSlaveName(io: socketio.Socket) {
	io.emit('infoMsg', {
		success: false,
		duplicate: true,
		msg: 'You are using a duplicate slave name. Killing connection.'
	});

	io.disconnect();
}

function IncorrectSecret(io: socketio.Socket) {
	io.emit('infoMsg', {
		success: false,
		invalid: true,
		msg: 'Invalid secret'
	});
	io.disconnect();
}

function RegisterSlave(socket: socketio.Socket, msg) {
	socket.set('name', msg.slave, function() { });
	socket.set('authed', true, function() { });
	slaveSockets[msg.slave] = socket;
	socket.emit('loginMsg', {
		success: true
	});
}