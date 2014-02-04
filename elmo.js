var Promise = require("bluebird")
var request = Promise.promisifyAll(require('request'));
var _ = require("underscore")._;

function Message(str) {
	this.body = str;
	this.time = new Date();

	this.info = function() {
		this.category = "INFO";
		return this;
	}
	this.warn = function() {
		this.category = "WARN";
		return this;		
	}
	this.error = function() {
		this.category = "ERROR";
		return this;
	}	
	this.toString = function() {
		return this.category + " :: " + this.time + " :: " + this.body;
	}
}

function asPromise(message) {
	return function(route) {
		return route(message);
	}
}

function Elmo(id, source) {
	this.log = function(message) {
		message.id = id;
		message.source = source;
		
		return Promise.all(_(this.routes).map(asPromise(message)));
	}
} 
var routes = {};

routes.console = Promise.method(function(message) {
	// Look at the type category of the message
	console.log(message.toString());
});

routes.remote = function(message) {
	return request.postAsync('http://elmo-io.herokuapp.com/api/'+message.id+'/message', {form: message});
}

module.exports.elmo = function (id, source) {
	return new Elmo(id, source);
}

module.exports.Elmo = Elmo;

module.exports.Elmo.prototype.msg = function(str) {
	return new Message(str);
}

module.exports.Elmo.prototype.routes = [routes.console, routes.remote];











