"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _path() {
  const data = require("path");

  _path = function _path() {
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

function _default(api) {
  // 注册乾坤插件
  api.registerPlugins([require.resolve('@umijs/plugin-model'), require.resolve('@umijs/plugin-qiankun')]);
  const paths = api.paths,
        winPath = api.utils.winPath;
  api.addRuntimePluginKey(() => 'request');
  const umiRequestPkgPath = winPath((0, _path().dirname)(require.resolve('umi-request/package')));
  const useRequestPkgPath = winPath((0, _path().dirname)(require.resolve('@ahooksjs/use-request/package')));
  api.addDepInfo(() => {
    const pkg = require('../package.json');

    return [{
      name: 'umi-request',
      range: pkg.dependencies['umi-request'],
      alias: [umiRequestPkgPath]
    }, {
      name: '@ahooksjs/use-request',
      range: pkg.dependencies['@ahooksjs/use-request'],
      alias: [useRequestPkgPath]
    }];
  }); // 配置

  api.describe({
    config: {
      schema(joi) {
        return joi.object({
          dataField: joi.string().pattern(/^[a-zA-Z]*$/).allow(''),
          proxy: joi.object()
        });
      },

      default: {
        dataField: 'data'
      }
    }
  });
  const requestTemplate = (0, _fs().readFileSync)(winPath((0, _path().join)(__dirname, '../src/request.ts')), 'utf-8');
  const uiIndexTemplate = (0, _fs().readFileSync)(winPath((0, _path().join)(__dirname, '../src/ui/index.ts')), 'utf-8');
  const uiNoopTemplate = (0, _fs().readFileSync)(winPath((0, _path().join)(__dirname, '../src/ui/noop.ts')), 'utf-8');
  const namespace = 'plugin-request';
  api.chainWebpack(webpackConfig => {
    var _api$config;

    // decoupling antd ui library
    webpackConfig.resolve.alias.set('@umijs/plugin-request/lib/ui', (api === null || api === void 0 ? void 0 : (_api$config = api.config) === null || _api$config === void 0 ? void 0 : _api$config.antd) === false ? winPath((0, _path().join)(api.paths.absTmpPath, namespace, './ui/noop')) : winPath((0, _path().join)(api.paths.absTmpPath, namespace, './ui/index')));
    return webpackConfig;
  });
  api.onGenerateFiles(() => {
    var _api$config2;

    const _ref = (api === null || api === void 0 ? void 0 : (_api$config2 = api.config) === null || _api$config2 === void 0 ? void 0 : _api$config2.planet) || {},
          _ref$dataField = _ref.dataField,
          dataField = _ref$dataField === void 0 ? 'data' : _ref$dataField;

    try {
      // Write .umi/plugin-request/request.ts
      let formatResultStr;
      let formatRequestUrl = '';

      if (dataField === '') {
        formatResultStr = 'formatResult: result => result';
      } else {
        formatResultStr = `formatResult: result => result?.${dataField}`;
      }

      const env = process.env.NODE_ENV || 'development';

      const _ref2 = api.config.planet || {},
            proxy = _ref2.proxy;

      if (proxy === null || proxy === void 0 ? void 0 : proxy[env]) {
        formatRequestUrl = proxy[env];
      }

      api.writeTmpFile({
        path: winPath((0, _path().join)(namespace, 'request.ts')),
        content: requestTemplate.replace(/\/\*FRS\*\/(.+)\/\*FRE\*\//, formatResultStr).replace(/\['data'\]/g, dataField ? `['${dataField}']` : '').replace(/data\?: T;/, dataField ? `${dataField}?: T;` : '').replace(/umi-request/g, umiRequestPkgPath).replace(/@ahooksjs\/use-request/g, useRequestPkgPath).replace(`import { ApplyPluginsType, history, plugin } from 'umi';`, `
import { ApplyPluginsType } from 'umi';
import { history, plugin } from '../core/umiExports';
            `).replace(/\/\*REQINTERCEPTORSSTART\*\/(.+)\/\*REQINTERCEPTORSEND\*\//, `
          requestMethodInstance.interceptors.request.use((url: any, options: any) => ({url: '${formatRequestUrl}'+url, options}))
          `) // set proxy

      });
      const uiTmpDir = (0, _path().join)(api.paths.absTmpPath, namespace, 'ui');
      !(0, _fs().existsSync)(uiTmpDir) && (0, _fs().mkdirSync)(uiTmpDir, {
        recursive: true
      });
      api.writeTmpFile({
        path: winPath((0, _path().join)(namespace, 'ui/index.ts')),
        content: uiIndexTemplate
      });
      api.writeTmpFile({
        path: winPath((0, _path().join)(namespace, 'ui/noop.ts')),
        content: uiNoopTemplate
      });
    } catch (e) {
      api.logger.error(e);
    }
  });
  api.addUmiExports(() => {
    return [{
      exportAll: true,
      source: `../${namespace}/request`
    }];
  });
}