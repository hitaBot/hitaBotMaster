/// <module name=hitaBot.database.mysql>
/// <reference path="../../typings/tsd.d.ts" />

import * as sequelize from 'sequelize';

var db = new sequelize('masterDb', 'root', 'nodejs', {
	host: 'localhost',
	dialect: 'mysql',
	pool: {
		max: 5,
		min: 0,
		idle: 10000
	}
});

export var Channel = db.define('channel', {
	channelName: {
		type: sequelize.STRING,
		allowNull: false
	},
	active: {
		type: sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0
	}
}, {
	indexes: [
		{
			unique: true,
			fields: ['channelName']
		}
	]
});