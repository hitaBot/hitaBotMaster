/// <reference path="../../typings/tsd.d.ts" />

import * as socketio from 'socket.io-client';
import * as config from '../config';
import * as hitbox from './hitbox/hitbox'
import * as utils from '../utils'
import * as server from '../server';

import * as Channel from '../database/models/channel';

var cfg = config.default;
var bots = new Map();
export var attemptingToJoin = new Map();

export function StartClients() {
	cfg.bots.forEach(element => {
		InitClient(element.bot, element.authToken);
	});
}

function Client(bot, auth, url) {
	if (bots.has(bot)) return;


	var io = socketio.connect(url, { 'force new connection': true });
	var t = this;
	bots.set(bot, io);

	io.on('connect', function() {
		console.log("connected");
		io.emit('message', {
			method: 'joinChannel',
			params: {
				name: bot,
				channel: bot.toLowerCase(),
				token: auth
			}
		})
	});

	io.on('message', function(msg) {
		var json = JSON.parse(msg);
		var params = json.params;

		if (params.buffer) return;
		console.log(msg);
		switch (json.method) {
			case 'chatMsg':
				if (params.text === '!join') {
					var p = Channel.GetActive(params.name).then(function(active) {
						if (active == 1) {
							SendMessageToChannel(bot, 'I\'m already in your channel.', io);
							return;
						}
						// Chanel is not active
						if (attemptingToJoin.has(params.name)) {
							SendMessageToChannel(bot, 'I\'m already trying to join your channel.', io);
						} else {
							attemptingToJoin.set(params.name, '');
							SendMessageToChannel(bot, 'Joining @' + params.name + ' channel.', io);
							Channel.SetActive(params.name, 1);
							SendJoinToSlaves(params, bot, auth);
						}
					});
				}
		}
	});
}

function InitClient(bot, auth) {
	utils.getHttp({ url: 'https://api.hitbox.tv/chat/servers', gzip: true }).then(function(data) {
		var jsonData = JSON.parse(data);
		Client(bot, auth, jsonData[0].server_ip.toString());
	});
}

function SendJoinToSlaves(params, bot, auth) {
	server.SendJoinToSlave(params.name, bot, auth);
}

function SendMessageToChannel(bot, text, io: SocketIOClient.Socket) {
	console.log('WHY DOESN\'T THIS WORK', io);
	io.emit('message', {
		method: 'chatMsg',
		params: {
			channel: bot.toLowerCase(),
			name: bot,
			nameColor: 'FFFFFF',
			text: text
		}
	});
}