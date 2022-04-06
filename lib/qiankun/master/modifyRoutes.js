"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = modifyRoutes;

var _common = require("../common");

var _constants = require("../constants");

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function modifyRoutes(api) {
  api.modifyRoutes(routes => {
    const _api$config = api.config,
          history = _api$config.history,
          base = _api$config.base;

    const _ref = api.config.qiankun || {},
          _ref$master = _ref.master,
          _ref$master2 = _ref$master === void 0 ? {} : _ref$master,
          _ref$master2$routeBin = _ref$master2.routeBindingAlias,
          routeBindingAlias = _ref$master2$routeBin === void 0 ? 'microApp' : _ref$master2$routeBin,
          _ref$master2$apps = _ref$master2.apps,
          apps = _ref$master2$apps === void 0 ? [] : _ref$master2$apps;

    const masterHistoryType = history && (history === null || history === void 0 ? void 0 : history.type) || _constants.defaultHistoryType; // 兼容以前的通过配置 base 自动注册应用的场景

    const registrableApps = apps.filter(app => app.base);

    if (registrableApps.length) {
      useLegacyModifyRoutesWithRegistrableMode(routes, registrableApps, masterHistoryType);
    }

    modifyRoutesWithAttachMode(routes, masterHistoryType, {
      routeBindingAlias,
      base: base || '/'
    });
    return routes;
  });
}

function modifyRoutesWithAttachMode(routes, masterHistoryType, opts) {
  const _opts$routeBindingAli = opts.routeBindingAlias,
        routeBindingAlias = _opts$routeBindingAli === void 0 ? 'microApp' : _opts$routeBindingAli,
        _opts$base = opts.base,
        base = _opts$base === void 0 ? '/' : _opts$base;

  const patchRoutes = routes => {
    if (routes.length) {
      const getMicroAppRouteComponent = opts => {
        const base = opts.base,
              masterHistoryType = opts.masterHistoryType,
              appName = opts.appName,
              routeProps = opts.routeProps;

        const normalizeJsonStringInUmiRoute = str => str.replace(/"/g, "'");

        const normalizedRouteProps = normalizeJsonStringInUmiRoute(JSON.stringify(routeProps));
        return `(() => {
          const { getMicroAppRouteComponent } = umiExports;
          return getMicroAppRouteComponent({ appName: '${appName}', base: '${base}', masterHistoryType: '${masterHistoryType}', routeProps: ${normalizedRouteProps} })
        })()`;
      };

      routes.forEach(route => {
        var _route$routes;

        (0, _common.patchMicroAppRoute)(route, getMicroAppRouteComponent, {
          base,
          masterHistoryType,
          routeBindingAlias
        });

        if ((_route$routes = route.routes) === null || _route$routes === void 0 ? void 0 : _route$routes.length) {
          patchRoutes(route.routes);
        }
      });
    }
  };

  patchRoutes(routes);
  return routes;
}
/**
 * 1.x 版本使用 base 配置加载微应用的方式
 * @param routes
 * @param apps
 * @param masterHistoryType
 */


function useLegacyModifyRoutesWithRegistrableMode(routes, apps, masterHistoryType) {
  // 获取一组路由中以 basePath 为前缀的路由
  const findRouteWithPrefix = (routes, basePath) => {
    // eslint-disable-next-line no-restricted-syntax
    var _iterator = _createForOfIteratorHelper(routes),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        const route = _step.value;
        if (route.path && (0, _common.testPathWithPrefix)(basePath, route.path)) return route;

        if (route.routes && route.routes.length) {
          return findRouteWithPrefix(route.routes, basePath);
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    return null;
  };

  return routes.map(route => {
    if (route.path === '/' && route.routes && route.routes.length) {
      apps.forEach(({
        history: slaveHistory = masterHistoryType,
        base
      }) => {
        if (!base) {
          return;
        } // 当子应用的 history mode 跟主应用一致时，为避免出现 404 手动为主应用创建一个 path 为 子应用 rule 的空 div 路由组件


        if (slaveHistory === masterHistoryType) {
          const baseConfig = (0, _common.toArray)(base);
          baseConfig.forEach(basePath => {
            const routeWithPrefix = findRouteWithPrefix(routes, basePath); // 应用没有自己配置过 basePath 相关路由，则自动加入 mock 的路由

            if (!routeWithPrefix) {
              route.routes.unshift({
                path: basePath,
                exact: false,
                component: `() => {
                        if (process.env.NODE_ENV === 'development') {
                          console.log('${basePath} 404 mock rendered');
                        }

                        const React = require('react');
                        return React.createElement('div');
                      }`
              });
            } else {
              // 若用户已配置过跟应用 base 重名的路由，则强制将该路由 exact 设置为 false，目的是兼容之前遗留的错误用法的场景
              routeWithPrefix.exact = false;
            }
          });
        }
      });
    }

    return route;
  });
}