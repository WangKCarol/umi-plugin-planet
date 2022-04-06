"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  isMasterEnable: true,
  isSlaveEnable: true
};
exports.default = _default;
Object.defineProperty(exports, "isMasterEnable", {
  enumerable: true,
  get: function get() {
    return _master.isMasterEnable;
  }
});
Object.defineProperty(exports, "isSlaveEnable", {
  enumerable: true,
  get: function get() {
    return _slave.isSlaveEnable;
  }
});

var _master = require("./master");

var _slave = require("./slave");

var _types = require("./types");

Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _types[key];
    }
  });
});

function _default(api) {
  api.addRuntimePluginKey(() => 'qiankun');
  api.describe({
    key: 'qiankun',
    config: {
      schema(joi) {
        return joi.object().keys({
          slave: joi.object(),
          master: joi.object()
        });
      }

    }
  });
  api.registerPlugins([require.resolve('./master'), require.resolve('./slave')]);
}