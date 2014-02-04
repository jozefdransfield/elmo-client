var Promise = require("bluebird")
var request = Promise.promisifyAll(require('request'));
var _ = require("underscore")._;
var colors = require('colors');

function Message() {
	this.time = new Date();
	this.category = "INFO"
	this.meta = {
		params: {}
	};
	
	this.param = function(name, value) {
		this.meta.params[name] = value;
		return this;
	}
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
		var out = this.source + " ";
		out += "<" + (this.meta.params.fileName + ":" + this.meta.params.lineNumber).underline + ">";
		out += " : " + this.time.toString() + " » " 
		switch(this.category) {
			case "ERROR":
				out = out.red;
				break;
			case "WARN":
				out = out.yellow;
				break;
			case "INFO":
				out = out.green;
				break;
		}
		
		out += this.body;
		
		var params = this.meta.params;
		_.chain(params).keys().reject(locationParameters).each(function(key) {
			 out += "\n\t " + key + " » " + JSON.stringify(params[key]) ; 
		});
		
		if (this.meta.params.stack) {
			out += "\n" + this.meta.params.stack	
		}
		
		return out;
	}
}

function locationParameters(key) {
	return key == "fileName" || key == "lineNumber" || key == "stack";
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
		
		// Need a way to be able to stop the chain
		return Promise.all(_(this.routes).map(asPromise(message)));
	}
} 
var routes = {};

routes.console = Promise.method(function(message) {
	switch(message.category) {
		case	 "ERROR":
			console.error(message.toString());
			break;
		case "WARN": 
			console.warn(message.toString());
			break;
		default: 
			console.log(message.toString());
	}
});

routes.remote = function(message) {
	return request.postAsync('http://elmo-io.herokuapp.com/api/'+message.id+'/message', {form: message});
}

module.exports.elmo = function (id, source) {
	return new Elmo(id, source);
}

module.exports.Elmo = Elmo;

module.exports.Elmo.prototype.msg = function(param) {
	var message = new Message();
	
	addFileAndLineInformation(message)	
	if (typeof (param) === "string") {
		message.body = param;	
	} else if ( typeof (param) === "object") {
		if ( param instanceof Error ) {
			message.body = param.message;
			message.category = "ERROR";
			if (param.lineNumber) {
				message.param("lineNumber", param.lineNumber);	
			}
			if (param.fileName) {
				message.param("fileName", param.fileName);		
			}
			message.param("stack", param.stack);
		} else {
			message.body = param.toString();
		}
		
	} else {
		throw new Error("Unknown type of object or function passed in")
	}
	return message;
}

function addFileAndLineInformation(message) {
	try {
		throw new Error();
	} catch (e) {
		var lines = e.stack.split("\n");
		var arr = /(\/.*):(.*):.*/.exec(lines[3]);
		message.param("fileName", arr[1]);
		message.param("lineNumber", arr[2]);
	}

}


module.exports.Elmo.prototype.routes = [routes.console/*, routes.remote*/];


module.exports.Elmo.prototype.helpers = {
	expressLogger : require("./logger.js")
};








