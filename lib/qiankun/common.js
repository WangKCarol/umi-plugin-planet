"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultMountContainerId = void 0;
exports.insertRoute = insertRoute;
exports.noop = void 0;
exports.patchMicroAppRoute = patchMicroAppRoute;
exports.testPathWithPrefix = testPathWithPrefix;
exports.toArray = toArray;
const _excluded = ["settings"];

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

/**
 * @author Kuitos
 * @since 2019-06-20
 */
const defaultMountContainerId = 'root-subapp'; // @formatter:off

exports.defaultMountContainerId = defaultMountContainerId;

const noop = () => {}; // @formatter:on


exports.noop = noop;

function toArray(source) {
  return Array.isArray(source) ? source : [source];
}

function testPathWithStaticPrefix(pathPrefix, realPath) {
  if (pathPrefix.endsWith('/')) {
    return realPath.startsWith(pathPrefix);
  }

  const pathRegex = new RegExp(`^${pathPrefix}([/?])+.*$`, 'g');
  const normalizedPath = `${realPath}/`;
  return pathRegex.test(normalizedPath);
}

function testPathWithDynamicRoute(dynamicRoute, realPath) {
  // FIXME 这个是旧的使用方式才会调到的 api，先临时这么苟一下消除报错，引导用户去迁移吧
  const pathToRegexp = require('path-to-regexp');

  return pathToRegexp(dynamicRoute, {
    strict: true,
    end: false
  }).test(realPath);
}

function testPathWithPrefix(pathPrefix, realPath) {
  return testPathWithStaticPrefix(pathPrefix, realPath) || testPathWithDynamicRoute(pathPrefix, realPath);
}

function patchMicroAppRoute(route, getMicroAppRouteComponent, masterOptions) {
  const base = masterOptions.base,
        masterHistoryType = masterOptions.masterHistoryType,
        routeBindingAlias = masterOptions.routeBindingAlias; // 当配置了 routeBindingAlias 时，优先从 routeBindingAlias 里取配置，但同时也兼容使用了默认的 microApp 方式

  const microAppName = route[routeBindingAlias] || route.microApp;
  const microAppProps = route[`${routeBindingAlias}Props`] || route.microAppProps || {};

  if (microAppName) {
    var _route$routes;

    if ((_route$routes = route.routes) === null || _route$routes === void 0 ? void 0 : _route$routes.length) {
      const childrenRouteHasComponent = route.routes.some(r => r.component);

      if (childrenRouteHasComponent) {
        throw new Error(`[@umijs/plugin-qiankun]: You can not attach micro app ${microAppName} to route ${route.path} whose children has own component!`);
      }
    }

    route.exact = false;

    const _microAppProps$settin = microAppProps.settings,
          settings = _microAppProps$settin === void 0 ? {} : _microAppProps$settin,
          componentProps = _objectWithoutProperties(microAppProps, _excluded);

    const routeProps = _objectSpread({
      // 兼容以前的 settings 配置
      settings: route.settings || settings || {}
    }, componentProps);

    const opts = {
      appName: microAppName,
      base,
      masterHistoryType,
      routeProps
    };
    route.component = getMicroAppRouteComponent(opts);
  }
}

const recursiveSearch = (routes, path, parentPath) => {
  for (let i = 0; i < routes.length; i++) {
    var _routes$i$routes;

    if (routes[i].path === path) {
      return [routes[i], routes, i, parentPath];
    }

    if (routes[i].routes && ((_routes$i$routes = routes[i].routes) === null || _routes$i$routes === void 0 ? void 0 : _routes$i$routes.length)) {
      const found = recursiveSearch(routes[i].routes || [], path, routes[i].path);

      if (found) {
        return found;
      }
    }
  }

  return null;
};

function insertRoute(routes, microAppRoute) {
  const mod = microAppRoute.appendChildTo || microAppRoute.insert ? 'appendChildTo' : microAppRoute.insertBefore ? 'insertBefore' : undefined;
  const target = microAppRoute.appendChildTo || microAppRoute.insert || microAppRoute.insertBefore;
  const result = recursiveSearch(routes, target, '/');

  if (result) {
    const _result = _slicedToArray(result, 4),
          found = _result[0],
          _result$ = _result[1],
          foundParentRoutes = _result$ === void 0 ? [] : _result$,
          _result$2 = _result[2],
          index = _result$2 === void 0 ? 0 : _result$2,
          parentPath = _result[3];

    switch (mod) {
      case 'appendChildTo':
        if (!microAppRoute.path || !found.path || !microAppRoute.path.startsWith(found.path)) {
          throw new Error(`[plugin-qiankun]: path "${microAppRoute.path}" need to starts with "${found.path}"`);
        }

        found.exact = false;
        found.routes = found.routes || [];
        found.routes.push(microAppRoute);
        break;

      case 'insertBefore':
        if (!microAppRoute.path || !found.path || !microAppRoute.path.startsWith(parentPath)) {
          throw new Error(`[plugin-qiankun]: path "${microAppRoute.path}" need to starts with "${parentPath}"`);
        }

        foundParentRoutes.splice(index, 0, microAppRoute);
        break;
    }
  } else {
    throw new Error(`[plugin-qiankun]: path "${target}" not found`);
  }
}