'use strict';

const toString = (obj) => Object.prototype.toString.call(obj).replace(/\[object (\S+)\]/, "$1");
const isObject = (obj) => toString(obj) === "Object";
const isArray = (obj) => toString(obj) === "Array";
const isFunction = (obj) => toString(obj) === "Function";
const isString = (obj) => toString(obj) === "String";
const isNumber = (obj) => toString(obj) === "Number";
const isBoolean = (obj) => toString(obj) === "Boolean";
const isNull = (obj) => toString(obj) === "Null";
const isUndefined = (obj) => toString(obj) === "Undefined";

exports.isArray = isArray;
exports.isBoolean = isBoolean;
exports.isFunction = isFunction;
exports.isNull = isNull;
exports.isNumber = isNumber;
exports.isObject = isObject;
exports.isString = isString;
exports.isUndefined = isUndefined;
