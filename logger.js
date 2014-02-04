module.exports = function(elmo) {
	return function(req, res, next) {
		req._startTime = new Date();

		function logRequest() {
			res.removeListener('finish', logRequest);
			res.removeListener('close', logRequest);

			var endTime = new Date();
			var time = endTime.getTime() - req._startTime.getTime();
			var msg = elmo.msg(req.method + " " + req.originalUrl + " " + res.statusCode + " " + time + "ms ");

			if (res.statusCode >= 400 && res.statusCode <= 499) {

				msg.warn();
			} else if (res.statusCode >= 500 && res.statusCode <= 599) {
				msg.error();
			}
			elmo.log(msg);
		}

		res.on('finish', logRequest);
		res.on('close', logRequest);

		next();
	};
};