/// <module name=hitaBot.commands.join>
/// <reference path="../../../typings/tsd.d.ts" />
var command = {
	name: '!join',
	params: {
		count: 1,
		optional: true,
	},
	role: 'anon',
	execute: function() {
		console.log('Ran Join!');
	}
}

export default command;