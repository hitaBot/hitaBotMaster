/// <module name=hitaBot.models.channel>
/// <reference path="../../../typings/tsd.d.ts" />

import * as db from '../mysql';

export function CreateChannel(channel: string) {
	db.Channel.findOrCreate({ where: { channelName: channel } }).spread(function(channel, created) {
		//console.log('channelCreate', channel);
	})
}

export function HasChannel(channel: string): BluebirdPromise<any> {
	var promise = db.Channel.findOne({ where: { channelName: channel } }).then(function(channel) {
		return channel;
	});

	return promise;
}

export function SetActive(channel: string, active: number): BluebirdPromise<any> {
	var promise = db.Channel.findOne({ where: { channelName: channel } }).then(function(channel: any) {
		return channel.update({ active: active });
	});

	return promise;
}

export function GetActive(channel: string): BluebirdPromise<any> {
	var promise = db.Channel.findOne({ where: { channelName: channel } }).then(function(channel: any) {
		if (channel.active != null)
			return channel.active;
		return 0;
	});
	return promise;
}