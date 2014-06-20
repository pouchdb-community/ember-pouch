"use strict";
var Adapter = require("./hal-adapter")["default"] || require("./hal-adapter");
var Serializer = require("./hal-serializer")["default"] || require("./hal-serializer");

exports.Adapter = Adapter;
exports.Serializer = Serializer;