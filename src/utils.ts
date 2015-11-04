import * as request from 'request';

export function getHttp(opts): Promise<string> {
	var promise = new Promise(function(resolve, reject) {
		request.get(opts, function(_, res, body) {
			if (!_ && res.statusCode == 200) {
				resolve(body.toString());
			} else {
				reject(Error('Failed GET'));
			}
		});
	});
	return promise;
}