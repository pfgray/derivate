"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var before = function (i) { return function (as) { return as.slice(0, i); }; };
var after = function (i) { return function (as) { return as.slice(i + 1, as.length); }; };
exports.splay = function (as) {
    return as.map(function (a, i, as) { return ({ focus: a, left: before(i)(as), right: after(i)(as) }); });
};
exports.map = function (f) {
    return function (ha) { return ({ left: ha.left.map(f), focus: f(ha.focus), right: ha.right.map(f) }); };
};
