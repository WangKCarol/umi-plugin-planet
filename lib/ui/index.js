"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "message", {
  enumerable: true,
  get: function get() {
    return _message().default;
  }
});
Object.defineProperty(exports, "notification", {
  enumerable: true,
  get: function get() {
    return _notification().default;
  }
});

require("antd/es/message/style");

function _message() {
  const data = _interopRequireDefault(require("antd/es/message"));

  _message = function _message() {
    return data;
  };

  return data;
}

require("antd/es/notification/style");

function _notification() {
  const data = _interopRequireDefault(require("antd/es/notification"));

  _notification = function _notification() {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }