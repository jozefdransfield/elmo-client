#!/usr/bin/env node

var elmo = require("./elmo");

elmo.init("1234")

var argv = require('optimist').usage("elmo-cli.js -category <CATEGORY> Message").default("category", "INFO").argv;

elmo.message(argv.category, argv._[0]);