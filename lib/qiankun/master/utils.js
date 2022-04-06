"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasExportWithName = hasExportWithName;

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

/**
 * copy from https://github.com/umijs/plugins/blob/master/packages/plugin-initial-state/src/utils/shouldPluginEnable.ts#L7
 */
const t = _umi().utils.t,
      parser = _umi().utils.parser; // TODO 待 https://github.com/umijs/umi/pull/4909 合并后改为 umi 中的实现


function hasExportWithName(opts) {
  const name = opts.name,
        filePath = opts.filePath;
  const content = (0, _fs().readFileSync)(filePath, 'utf-8');
  const isTS = (0, _path().extname)(filePath) === '.ts';
  const isTSX = (0, _path().extname)(filePath) === '.tsx';
  const p = [];

  if (!isTS) {
    p.push('jsx');
  }

  if (isTS || isTSX) {
    p.push('typescript');
  }

  const ast = parser.parse(content, {
    sourceType: 'module',
    // @ts-ignore
    plugins: [...p, // 支持更多语法
    'classProperties', 'dynamicImport', 'exportDefaultFrom', 'exportNamespaceFrom', 'functionBind', 'nullishCoalescingOperator', 'objectRestSpread', 'optionalChaining', 'decorators-legacy']
  });
  let hasExport = false;
  ast.program.body.forEach(node => {
    if (t.isExportNamedDeclaration(node)) {
      if (node.declaration) {
        // export function xxx(){};
        if (t.isFunctionDeclaration(node.declaration)) {
          const id = node.declaration.id;

          if (t.isIdentifier(id) && id.name === name) {
            hasExport = true;
          }
        } // export const xxx = () => {};


        if (t.isVariableDeclaration(node.declaration) && node.declaration.declarations) {
          if (node.declaration.declarations.some(declaration => {
            return t.isVariableDeclarator(declaration) && t.isIdentifier(declaration.id) && declaration.id.name === name;
          })) {
            hasExport = true;
          }
        }
      } // export { getInitialState };


      if (node.specifiers && // @ts-ignore
      node.specifiers.some(specifier => specifier.exported.name === name)) {
        hasExport = true;
      }
    }
  });
  return hasExport;
}