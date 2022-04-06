"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.qiankunStateFromMasterModelNamespace = exports.qiankunStateForSlaveModelNamespace = exports.defaultMasterRootId = exports.defaultHistoryType = void 0;
const defaultMasterRootId = 'root-master';
exports.defaultMasterRootId = defaultMasterRootId;
const defaultHistoryType = 'browser';
exports.defaultHistoryType = defaultHistoryType;
const qiankunStateForSlaveModelNamespace = '@@qiankunStateForSlave';
exports.qiankunStateForSlaveModelNamespace = qiankunStateForSlaveModelNamespace;
const qiankunStateFromMasterModelNamespace = '@@qiankunStateFromMaster';
exports.qiankunStateFromMasterModelNamespace = qiankunStateFromMasterModelNamespace;