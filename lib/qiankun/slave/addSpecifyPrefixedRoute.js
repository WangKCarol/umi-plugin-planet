"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addSpecifyPrefixedRoute = void 0;

function _lodash() {
  const data = require("lodash");

  _lodash = function _lodash() {
    return data;
  };

  return data;
}

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const recursiveCoverRouter = (source, nameSpacePath) => source.map(router => {
  if (router.routes) {
    recursiveCoverRouter(router.routes, nameSpacePath);
  }

  if (router.path !== '/' && router.path) {
    return _objectSpread(_objectSpread({}, router), {}, {
      path: `${nameSpacePath}${router.path}`
    });
  }

  return router;
});

const addSpecifyPrefixedRoute = (originRoute, keepOriginalRoutes, pkgName) => {
  const copyBase = originRoute.filter(_ => _.path === '/');

  if (!copyBase[0]) {
    return originRoute;
  }

  const nameSpaceRouter = (0, _lodash().cloneDeep)(copyBase[0]);
  const nameSpace = keepOriginalRoutes === true ? pkgName : keepOriginalRoutes;
  nameSpaceRouter.path = `/${nameSpace}`;
  nameSpaceRouter.routes = recursiveCoverRouter(nameSpaceRouter.routes, `/${nameSpace}`);
  return [nameSpaceRouter, ...originRoute];
};

exports.addSpecifyPrefixedRoute = addSpecifyPrefixedRoute;