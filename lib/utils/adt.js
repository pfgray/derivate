"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function match(v) {
    return function (matchObj) { return matchObj[v._type](v); };
}
exports.match = match;
;
