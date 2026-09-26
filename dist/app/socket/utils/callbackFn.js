"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const callbackFn = (callback, data) => {
    if (typeof callback === 'function') {
        callback(data);
    }
};
exports.default = callbackFn;
