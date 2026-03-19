"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.perimeter = exports.area = void 0;
const area = (width, length) => {
    return width * length;
};
exports.area = area;
const perimeter = (width, length) => {
    return (width * 2) + (length * 2);
};
exports.perimeter = perimeter;
