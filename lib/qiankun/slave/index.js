"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
exports.isSlaveEnable = isSlaveEnable;

function _address() {
  const data = _interopRequireDefault(require("address"));

  _address = function _address() {
    return data;
  };

  return data;
}

function _assert() {
  const data = _interopRequireDefault(require("assert"));

  _assert = function _assert() {
    return data;
  };

  return data;
}

function _fs() {
  const data = require("fs");

  _fs = function _fs() {
    return data;
  };

  return data;
}

function _lodash() {
  const data = require("lodash");

  _lodash = function _lodash() {
    return data;
  };

  return data;
}

function _path() {
  const data = require("path");

  _path = function _path() {
    return data;
  };

  return data;
}

var _constants = require("../constants");

var _addSpecifyPrefixedRoute = require("./addSpecifyPrefixedRoute");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function isSlaveEnable(api) {
  var _api$userConfig, _api$userConfig$qiank, _api$userConfig2;

  const slaveCfg = (_api$userConfig = api.userConfig) === null || _api$userConfig === void 0 ? void 0 : (_api$userConfig$qiank = _api$userConfig.qiankun) === null || _api$userConfig$qiank === void 0 ? void 0 : _api$userConfig$qiank.slave;

  if (slaveCfg) {
    return slaveCfg.enable !== false;
  } // 兼容早期配置， qiankun 配一个空，相当于开启 slave


  if ((0, _lodash().isEqual)((_api$userConfig2 = api.userConfig) === null || _api$userConfig2 === void 0 ? void 0 : _api$userConfig2.qiankun, {})) {
    return true;
  }

  return !!process.env.INITIAL_QIANKUN_SLAVE_OPTIONS;
}

function _default(api) {
  api.describe({
    enableBy: () => isSlaveEnable(api)
  });
  api.addRuntimePlugin(() => '@@/plugin-qiankun/slaveRuntimePlugin');
  api.register({
    key: 'addExtraModels',
    fn: () => [{
      absPath: '@@/plugin-qiankun/qiankunModel',
      namespace: _constants.qiankunStateFromMasterModelNamespace
    }]
  }); // eslint-disable-next-line import/no-dynamic-require, global-require

  api.modifyDefaultConfig(memo => {
    var _api$userConfig$qiank2, _api$userConfig$qiank3, _api$userConfig$qiank4;

    const initialSlaveOptions = _objectSpread(_objectSpread({
      devSourceMap: true
    }, JSON.parse(process.env.INITIAL_QIANKUN_SLAVE_OPTIONS || '{}')), (memo.qiankun || {}).slave);

    const modifiedDefaultConfig = _objectSpread(_objectSpread({}, memo), {}, {
      disableGlobalVariables: true,
      // 默认开启 runtimePublicPath，避免出现 dynamic import 场景子应用资源地址出问题
      runtimePublicPath: true,
      runtimeHistory: {},
      qiankun: _objectSpread(_objectSpread({}, memo.qiankun), {}, {
        slave: initialSlaveOptions
      })
    });

    const shouldNotModifyDefaultBase = (_api$userConfig$qiank2 = (_api$userConfig$qiank3 = api.userConfig.qiankun) === null || _api$userConfig$qiank3 === void 0 ? void 0 : (_api$userConfig$qiank4 = _api$userConfig$qiank3.slave) === null || _api$userConfig$qiank4 === void 0 ? void 0 : _api$userConfig$qiank4.shouldNotModifyDefaultBase) !== null && _api$userConfig$qiank2 !== void 0 ? _api$userConfig$qiank2 : initialSlaveOptions.shouldNotModifyDefaultBase;

    if (!shouldNotModifyDefaultBase) {
      modifiedDefaultConfig.base = `/${api.pkg.name}`;
    }

    return modifiedDefaultConfig;
  });
  api.modifyConfig(config => {
    // mfsu 场景默认给子应用增加 mfName 配置，从而避免冲突
    if (config.mfsu && !config.mfsu.mfName) {
      var _api$pkg$name;

      // 替换掉包名里的特殊字符
      config.mfsu.mfName = `mf_${(_api$pkg$name = api.pkg.name) === null || _api$pkg$name === void 0 ? void 0 : _api$pkg$name.replace(/^@/, '').replace(/\W/g, '_')}`;
    }

    return config;
  });
  api.modifyPublicPathStr(publicPathStr => {
    const runtimePublicPath = api.config.runtimePublicPath;
    const _ref = (api.config.qiankun || {}).slave,
          shouldNotModifyRuntimePublicPath = _ref.shouldNotModifyRuntimePublicPath;

    if (runtimePublicPath === true && !shouldNotModifyRuntimePublicPath) {
      return `window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ || "${api.config.publicPath || '/'}"`;
    }

    return publicPathStr;
  });
  api.chainWebpack((config, {
    webpack
  }) => {
    var _webpack$version;

    (0, _assert().default)(api.pkg.name, 'You should have name in package.json');
    const _ref2 = (api.config.qiankun || {}).slave,
          shouldNotAddLibraryChunkName = _ref2.shouldNotAddLibraryChunkName;
    config.output.libraryTarget('umd').library(shouldNotAddLibraryChunkName ? api.pkg.name : `${api.pkg.name}-[name]`);
    const usingWebpack5 = (_webpack$version = webpack.version) === null || _webpack$version === void 0 ? void 0 : _webpack$version.startsWith('5'); // webpack5 移除了 jsonpFunction 配置，且不再需要配置 jsonpFunction，see https://webpack.js.org/blog/2020-10-10-webpack-5-release/#automatic-unique-naming

    if (!usingWebpack5) {
      config.output.jsonpFunction(`webpackJsonp_${api.pkg.name}`);
    }

    return config;
  }); // umi bundle 添加 entry 标记

  api.modifyHTML($ => {
    $('script').each((_, el) => {
      var _scriptEl$attr;

      const scriptEl = $(el);
      const umiEntryJs = /\/?umi(\.\w+)?\.js$/g;

      if (umiEntryJs.test((_scriptEl$attr = scriptEl.attr('src')) !== null && _scriptEl$attr !== void 0 ? _scriptEl$attr : '')) {
        scriptEl.attr('entry', '');
      }
    });
    return $;
  });
  api.chainWebpack((memo, {
    webpack
  }) => {
    const port = process.env.PORT; // source-map 跨域设置

    if (api.env === 'development' && port) {
      const localHostname = process.env.USE_REMOTE_IP ? _address().default.ip() : process.env.HOST || 'localhost';
      const protocol = process.env.HTTPS ? 'https' : 'http'; // 变更 webpack-dev-server websocket 默认监听地址

      process.env.SOCKET_SERVER = `${protocol}://${localHostname}:${port}/`; // 开启了 devSourceMap 配置，默认为 true

      if (api.config.qiankun && api.config.qiankun.slave.devSourceMap) {
        // 禁用 devtool，启用 SourceMapDevToolPlugin
        memo.devtool(false);
        memo.plugin('source-map').use(webpack.SourceMapDevToolPlugin, [{
          // @ts-ignore
          namespace: api.pkg.name,
          append: `\n//# sourceMappingURL=${protocol}://${localHostname}:${port}/[url]`,
          filename: '[file].map'
        }]);
      }
    }

    return memo;
  });
  api.addEntryImports(() => {
    return {
      source: '@@/plugin-qiankun/lifecycles',
      specifier: '{ genMount as qiankun_genMount, genBootstrap as qiankun_genBootstrap, genUnmount as qiankun_genUnmount, genUpdate as qiankun_genUpdate }'
    };
  });
  api.addEntryCode(() => `
    export const bootstrap = qiankun_genBootstrap(clientRender);
    export const mount = qiankun_genMount('${api.config.mountElementId}');
    export const unmount = qiankun_genUnmount('${api.config.mountElementId}');
    export const update = qiankun_genUpdate();

    if (!window.__POWERED_BY_QIANKUN__) {
      bootstrap().then(mount);
    }
    `);
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'plugin-qiankun/slaveOptions.js',
      content: `
      let options = ${JSON.stringify((api.config.qiankun || {}).slave || {})};
      export const getSlaveOptions = () => options;
      export const setSlaveOptions = (newOpts) => options = ({ ...options, ...newOpts });
      `
    });
    api.writeTmpFile({
      path: 'plugin-qiankun/qiankunModel.ts',
      content: (0, _fs().readFileSync)((0, _path().join)(__dirname, 'qiankunModel.ts.tpl'), 'utf-8')
    });
    api.writeTmpFile({
      path: 'plugin-qiankun/connectMaster.tsx',
      content: (0, _fs().readFileSync)((0, _path().join)(__dirname, 'connectMaster.tsx.tpl'), 'utf-8')
    });
    api.writeTmpFile({
      path: 'plugin-qiankun/slaveRuntimePlugin.ts',
      content: (0, _fs().readFileSync)((0, _path().join)(__dirname, 'slaveRuntimePlugin.ts.tpl'), 'utf-8')
    });
    api.writeTmpFile({
      path: 'plugin-qiankun/lifecycles.ts',
      content: (0, _fs().readFileSync)((0, _path().join)(__dirname, 'lifecycles.ts.tpl'), 'utf-8')
    });
  });
  useLegacyMode(api);
}

function useLegacyMode(api) {
  var _api$userConfig3, _api$userConfig3$qian;

  const options = (_api$userConfig3 = api.userConfig) === null || _api$userConfig3 === void 0 ? void 0 : (_api$userConfig3$qian = _api$userConfig3.qiankun) === null || _api$userConfig3$qian === void 0 ? void 0 : _api$userConfig3$qian.slave;

  const _ref3 = options || {},
        _ref3$keepOriginalRou = _ref3.keepOriginalRoutes,
        keepOriginalRoutes = _ref3$keepOriginalRou === void 0 ? false : _ref3$keepOriginalRou;

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'plugin-qiankun/qiankunContext.js',
      content: `
      import { createContext, useContext } from 'react';

      export const Context = createContext(null);
      export function useRootExports() {
        if (process.env.NODE_ENV === 'development') {
          console.error(
            '[@umijs/plugin-qiankun] Deprecated: useRootExports 通信方式不再推荐，并将在后续版本中移除，请尽快升级到新的应用通信模式，以获得更好的开发体验。详见 https://umijs.org/plugins/plugin-qiankun#%E7%88%B6%E5%AD%90%E5%BA%94%E7%94%A8%E9%80%9A%E8%AE%AF',
          );
        }
        return useContext(Context);
      }`.trim()
    });
  });
  api.addUmiExports(() => [{
    specifiers: ['useRootExports'],
    source: '../plugin-qiankun/qiankunContext'
  }, {
    specifiers: ['connectMaster'],
    source: '../plugin-qiankun/connectMaster'
  }]);
  api.modifyRoutes(routes => {
    // 开启keepOriginalRoutes配置
    if (keepOriginalRoutes === true || (0, _lodash().isString)(keepOriginalRoutes)) {
      return (0, _addSpecifyPrefixedRoute.addSpecifyPrefixedRoute)(routes, keepOriginalRoutes, api.pkg.name);
    }

    return routes;
  });
}