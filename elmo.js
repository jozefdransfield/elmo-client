var Promise = require("bluebird")
var request = Promise.promisifyAll(require('request'));

function Message() {

}

function MessageBuilder(id, source, str) {
	var message = new Message();
	message.id = id;
	message.source = source;
	message.body = str;

	this.info = function() {
		message.category = "INFO";
		return this;
	}
	this.warn = function() {
		message.category = "WARN";
		return this;		
	}
	this.error = function() {
		message.category = "ERROR";
		return this;
	}	
	
	this.log = function() {
		return request.postAsync('http://elmo-io.herokuapp.com/api/'+message.id+'/message', {form: message}).
		spread(function(request, body) {
			console.log(body);
		}).
		catch(function(err) {
			console.error(err);
		});

	}
}

module.exports.Elmo = function Elmo(id, source) {
	return {
		id : id,
		source : source,
		message: function(str) {
			return new MessageBuilder(this.id, this.source, str);		
		}
	}
}






