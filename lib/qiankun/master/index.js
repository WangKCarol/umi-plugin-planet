"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
exports.isMasterEnable = isMasterEnable;

function _fs() {
  const data = require("fs");

  _fs = function _fs() {
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

function _umi() {
  const data = require("umi");

  _umi = function _umi() {
    return data;
  };

  return data;
}

var _constants = require("../constants");

var _modifyRoutes = _interopRequireDefault(require("./modifyRoutes"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const getFile = _umi().utils.getFile,
      winPath = _umi().utils.winPath;

function isMasterEnable(api) {
  var _api$userConfig, _api$userConfig$qiank;

  const masterCfg = (_api$userConfig = api.userConfig) === null || _api$userConfig === void 0 ? void 0 : (_api$userConfig$qiank = _api$userConfig.qiankun) === null || _api$userConfig$qiank === void 0 ? void 0 : _api$userConfig$qiank.master;

  if (masterCfg) {
    return masterCfg.enable !== false;
  }

  return !!process.env.INITIAL_QIANKUN_MASTER_OPTIONS;
}

function _default(api) {
  api.describe({
    enableBy: () => isMasterEnable(api)
  });
  api.addRuntimePlugin(() => '@@/plugin-qiankun/masterRuntimePlugin');
  api.modifyDefaultConfig(config => _objectSpread(_objectSpread({}, config), {}, {
    mountElementId: _constants.defaultMasterRootId,
    disableGlobalVariables: true,
    qiankun: _objectSpread(_objectSpread({}, config.qiankun), {}, {
      master: _objectSpread(_objectSpread({}, JSON.parse(process.env.INITIAL_QIANKUN_MASTER_OPTIONS || '{}')), (config.qiankun || {}).master)
    })
  }));
  (0, _modifyRoutes.default)(api);
  const appFile = getFile({
    base: api.paths.absSrcPath,
    fileNameWithoutExt: 'app',
    type: 'javascript'
  });

  if (appFile) {
    const exportName = 'useQiankunStateForSlave';
    const hasExport = (0, _utils.hasExportWithName)({
      name: exportName,
      filePath: appFile.path
    });

    if (hasExport) {
      api.addRuntimePluginKey(() => exportName);
      api.register({
        key: 'addExtraModels',
        fn: () => [{
          absPath: winPath(appFile.path),
          namespace: _constants.qiankunStateForSlaveModelNamespace,
          exportName
        }]
      });
    }
  }

  api.onGenerateFiles(() => {
    var _api$config;

    const history = api.config.history;

    const _ref = ((_api$config = api.config) === null || _api$config === void 0 ? void 0 : _api$config.qiankun) || {},
          options = _ref.master;

    const masterHistoryType = history && (history === null || history === void 0 ? void 0 : history.type) || _constants.defaultHistoryType;
    const base = api.config.base || '/';
    api.writeTmpFile({
      path: 'plugin-qiankun/masterOptions.js',
      content: `
      let options = ${JSON.stringify(_objectSpread({
        masterHistoryType,
        base
      }, options))};
      export const getMasterOptions = () => options;
      export const setMasterOptions = (newOpts) => options = ({ ...options, ...newOpts });
      `
    });
    api.writeTmpFile({
      path: 'plugin-qiankun/MicroApp.tsx',
      content: (0, _fs().readFileSync)((0, _path().join)(__dirname, 'MicroApp.tsx.tpl'), 'utf-8')
    });
    api.writeTmpFile({
      path: 'plugin-qiankun/MicroAppWithMemoHistory.tsx',
      content: (0, _fs().readFileSync)((0, _path().join)(__dirname, 'MicroAppWithMemoHistory.tsx.tpl'), 'utf-8')
    });
    api.writeTmpFile({
      path: 'plugin-qiankun/masterRuntimePlugin.ts',
      content: (0, _fs().readFileSync)((0, _path().join)(__dirname, 'masterRuntimePlugin.ts.tpl'), 'utf-8')
    });
    api.writeTmpFile({
      path: 'plugin-qiankun/common.ts',
      content: (0, _fs().readFileSync)((0, _path().join)(__dirname, '../../../src/qiankun/common.ts'), 'utf-8')
    });
    api.writeTmpFile({
      path: 'plugin-qiankun/constants.ts',
      content: (0, _fs().readFileSync)((0, _path().join)(__dirname, '../../../src/qiankun/constants.ts'), 'utf-8')
    });
    api.writeTmpFile({
      path: 'plugin-qiankun/types.ts',
      content: (0, _fs().readFileSync)((0, _path().join)(__dirname, '../../../src/qiankun/types.ts'), 'utf-8')
    });
    api.writeTmpFile({
      path: 'plugin-qiankun/MicroAppLoader.tsx',
      // 开启了 antd 插件的时候，使用 antd 的 loader 组件，否则提示用户必须设置一个自定义的 loader 组件
      content: api.hasPlugins(['@umijs/plugin-antd']) ? (0, _fs().readFileSync)((0, _path().join)(__dirname, 'AntdLoader.tsx.tpl'), 'utf-8') : `export default function Loader() { console.warn(\`[@umijs/plugin-qiankun]: Seems like you'r not using @umijs/plugin-antd, you need to provide a custom loader or set autoSetLoading false to shut down this warning!\`); return null; }`
    });
    api.writeTmpFile({
      path: 'plugin-qiankun/ErrorBoundary.tsx',
      // 开启了 antd 插件的时候，使用 antd 的 ErrorBoundary，否则提示用户必须设置一个自定义的 ErrorBoundary 组件
      content: _umi().utils.Mustache.render(api.hasPlugins(['@umijs/plugin-antd']) ? (0, _fs().readFileSync)((0, _path().join)(__dirname, 'AntdErrorBoundary.tsx.tpl'), 'utf-8') : (0, _fs().readFileSync)((0, _path().join)(__dirname, 'ErrorBoundary.tsx.tpl'), 'utf-8'), {
        enableLocale: api.hasPlugins(['@umijs/plugin-locale'])
      })
    });
    api.writeTmpFile({
      path: 'plugin-qiankun/getMicroAppRouteComponent.ts',
      content: _umi().utils.Mustache.render((0, _fs().readFileSync)((0, _path().join)(__dirname, 'getMicroAppRouteComponent.ts.tpl'), 'utf-8'), {
        runtimeHistory: api.config.runtimeHistory,
        dynamicRoot: api.config.exportStatic && api.config.exportStatic.dynamicRoot
      })
    });
  });
  api.addUmiExports(() => {
    var _api$config2;

    const pinnedExport = 'MicroApp';
    const exports = [{
      specifiers: [pinnedExport],
      source: winPath('../plugin-qiankun/MicroApp')
    }];
    const _ref2 = (((_api$config2 = api.config) === null || _api$config2 === void 0 ? void 0 : _api$config2.qiankun) || {}).master,
          exportComponentAlias = _ref2.exportComponentAlias; // 存在别名导出时再导出一份别名

    if (exportComponentAlias && exportComponentAlias !== pinnedExport) {
      exports.push({
        specifiers: [{
          local: pinnedExport,
          exported: exportComponentAlias
        }],
        source: winPath('../plugin-qiankun/MicroApp')
      });
    }

    return exports;
  });
  api.addUmiExports(() => {
    return {
      specifiers: ['getMasterOptions'],
      source: winPath('../plugin-qiankun/masterOptions.js')
    };
  });
  api.addUmiExports(() => {
    return {
      specifiers: ['MicroAppWithMemoHistory'],
      source: winPath('../plugin-qiankun/MicroAppWithMemoHistory')
    };
  });
  api.addUmiExports(() => {
    return {
      specifiers: ['getMicroAppRouteComponent'],
      source: winPath('../plugin-qiankun/getMicroAppRouteComponent')
    };
  });
  useCompatibleMode(api);
}

function useCompatibleMode(api) {
  const rootExportsJsFile = getFile({
    base: api.paths.absSrcPath,
    type: 'javascript',
    fileNameWithoutExt: 'rootExports'
  });

  if (rootExportsJsFile) {
    api.addTmpGenerateWatcherPaths(() => rootExportsJsFile.path);
  }

  api.onGenerateFiles(() => {
    const rootExports = `
    if (typeof window !== 'undefined') {
      window.g_rootExports = ${rootExportsJsFile ? `require('@/rootExports')` : `{}`};
    }
    `.trim();
    api.writeTmpFile({
      path: 'plugin-qiankun/qiankunRootExports.js',
      content: rootExports
    }); // TODO 兼容以前版本的 defer 配置，后续需要移除

    api.writeTmpFile({
      path: 'plugin-qiankun/qiankunDefer.js',
      content: `
      class Deferred {
        constructor() {
          this.promise = new Promise(resolve => this.resolve = resolve);
        }
      }
      export const deferred = new Deferred();
      export const qiankunStart = deferred.resolve;
    `.trim()
    });
  });
  api.addDepInfo(() => {
    return {
      name: 'qiankun',
      range: require('../../package.json').dependencies.qiankun
    };
  }); // TODO 兼容以前版本的 defer 配置，后续需要移除

  api.addUmiExports(() => [{
    specifiers: ['qiankunStart'],
    source: winPath('../plugin-qiankun/qiankunDefer')
  }]);
}