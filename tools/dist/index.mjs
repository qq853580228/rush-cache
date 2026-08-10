const toString = (obj) => Object.prototype.toString.call(obj).replace(/\[object (\S+)\]/, "$1");
const isObject = (obj) => toString(obj) === "Object";
const isArray = (obj) => toString(obj) === "Array";
const isFunction = (obj) => toString(obj) === "Function";
const isString = (obj) => toString(obj) === "String";
const isNumber = (obj) => toString(obj) === "Number";
const isBoolean = (obj) => toString(obj) === "Boolean";
const isNull = (obj) => toString(obj) === "Null";
const isUndefined = (obj) => toString(obj) === "Undefined";

export { isArray, isBoolean, isFunction, isNull, isNumber, isObject, isString, isUndefined };
