"use strict";
var Adapter = require("./pouchdb-adapter")["default"] || require("./pouchdb-adapter");
var Serializer = require("./pouchdb-serializer")["default"] || require("./pouchdb-serializer");

exports.Adapter = Adapter;
exports.Serializer = Serializer;