"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.notification = exports.message = void 0;

const noop = () => {};

const message = {
  warn: noop,
  error: noop
};
exports.message = message;
const notification = {
  open: noop
};
exports.notification = notification;