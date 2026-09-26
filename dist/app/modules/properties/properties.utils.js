"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyAddress = exports.toArray = void 0;
const toArray = (value) => {
    if (!value)
        return undefined;
    if (Array.isArray(value))
        return value;
    return value.split(',').map((v) => v.trim()).filter(Boolean);
};
exports.toArray = toArray;
const propertyAddress = (streetAddress, city, state, zipCode, county) => {
    return [streetAddress, city, state, zipCode, county]
        .filter(Boolean)
        .join(", ");
};
exports.propertyAddress = propertyAddress;
