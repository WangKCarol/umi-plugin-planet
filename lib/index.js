"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _default(api) {
  // 注册乾坤插件
  if (!api.hasPlugins(['@umijs/plugin-model'])) {
    api.registerPlugins([require.resolve('@umijs/plugin-model')]);
  }

  if (api.hasPlugins(['@umijs/plugin-request'])) {
    api.skipPlugins(['@umijs/plugin-request']);
  }

  if (api.hasPlugins(['@umijs/plugin-qiankun'])) {
    api.skipPlugins(['@umijs/plugin-qiankun']);
  }

  api.registerPlugins([require.resolve('./planet'), require.resolve('./qiankun')]);
}