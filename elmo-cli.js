#!/usr/bin/env node

var elmo = require("./elmo").elmo("1234", "elmo-cli");

var argv = require('optimist').usage("elmo-cli.js <message>").argv;

elmo.log(elmo.msg(argv._[0]));


try {
	throw new Error("bum")
} catch(err) {
	elmo.log(elmo.msg(err).param("awesomeness", 12));	
}

try {
	throw "Eh oh";
} catch(err) {
	elmo.log(elmo.msg(err));
}
