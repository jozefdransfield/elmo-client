#!/usr/bin/env node

var elmo = require("./elmo").elmo("1234", "elmo-cli");

var argv = require('optimist').usage("elmo-cli.js <message>").argv;

elmo.log(elmo.msg(argv._[0]).info());