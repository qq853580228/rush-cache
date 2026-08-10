const toString = (obj) => Object.prototype.toString.call(obj).replace(/\[object (\S+)\]/, '$1')

export const isObject = (obj) => toString(obj) === 'Object'
export const isArray = (obj) => toString(obj) === 'Array'
export const isFunction = (obj) => toString(obj) === 'Function'
export const isString = (obj) => toString(obj) === 'String'
export const isNumber = (obj) => toString(obj) === 'Number'
export const isBoolean = (obj) => toString(obj) === 'Boolean'
export const isNull = (obj) => toString(obj) === 'Null'
export const isUndefined = (obj) => toString(obj) === 'Undefined'


