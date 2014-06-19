define(
  ["./hal-adapter","./hal-serializer","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var HALAdapter = __dependency1__["default"] || __dependency1__;
    var HALSerializer = __dependency2__["default"] || __dependency2__;

    __exports__.HALAdapter = HALAdapter;
    __exports__.HALSerializer = HALSerializer;
  });