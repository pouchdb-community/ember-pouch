"use strict";
var HALAdapter = require("./hal-adapter")["default"] || require("./hal-adapter");
var HALSerializer = require("./hal-serializer")["default"] || require("./hal-serializer");

exports.HALAdapter = HALAdapter;
exports.HALSerializer = HALSerializer;