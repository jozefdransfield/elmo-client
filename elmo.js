var Promise = require("bluebird")
var request = Promise.promisifyAll(require('request'));

function Message(category, context, body) {
	this.category = category;
	this.context = context;
	this.body = body;
}

module.exports = {
	init: function(id) {
		this.id = id;
		return this;
	},
	info: function(body) {
		return this.message("INFO", body);
	},
	warn: function(body) {
		return this.message("WARN", body);
	},
	error: function(body) {
		return this.message("ERROR", body);
	},
	message: function(category, body) {
		var message = new Message(category, null, body);
		
		return request.postAsync('http://elmo-io.herokuapp.com/api/'+this.id+'/message', {form: message}).
		spread(function(request, body) {
			console.log(body);
		}).
		catch(function(err) {
			console.error(err);
		});

	}
}




