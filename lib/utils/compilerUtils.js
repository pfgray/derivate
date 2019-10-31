"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Apply_1 = require("fp-ts/lib/Apply");
var A = require("fp-ts/lib/Array");
var function_1 = require("fp-ts/lib/function");
var O = require("fp-ts/lib/Option");
var pipeable_1 = require("fp-ts/lib/pipeable");
var ts = require("typescript");
exports.isStr = function (k) { return function (s) {
    return s === k ? O.some(s) : O.none;
}; };
exports.toArray = function (a) {
    return O.isSome(a) ? [a.value] : [];
};
exports.extract = function (f) { return function (u) { return (f(u) ? O.some(u) : O.none); }; };
/**
 * Returns true if the symbol comes from the module specified, with
 * the specified name.
 *
 * Works with renamed imports
 *
 * @param name
 * @param moduleName
 */
exports.symbolMatches = function (name, moduleName) {
    return function (s) {
        return pipeable_1.pipe(s.declarations, A.chain(function_1.flow(exports.access('parent'), exports.extract(ts.isNamedImports), exports.toArray)), A.chain(function (ni) {
            return pipeable_1.pipe(Apply_1.sequenceS(O.option)({
                mn: exports.extractModuleNameFromNamedImports(ni),
                id: exports.getOriginalNameFromNamedImports(s, ni)
            }), O.map(function (_a) {
                var mn = _a.mn, id = _a.id;
                return mn === moduleName && id === name;
            }), exports.toArray);
        }), A.findFirst(function_1.identity), O.getOrElse(function () { return false; }));
    };
};
var asArray = function (n) {
    return n.map(function_1.identity);
};
// if the text matches the symbol, then return the propertyName if defined, else return the text
/**
 * Get the _real_ (or, 'original') name of the first named import
 * in this NamedImports.
 */
exports.getOriginalNameFromNamedImports = function (s, ni) {
    return pipeable_1.pipe(ni.elements, asArray, A.findFirstMap(function (is) {
        return pipeable_1.pipe(is.name.text, exports.isStr(s.name), O.chain(function (text) { return pipeable_1.pipe(O.fromNullable(is.propertyName), O.map(function (i) { return i.text; }), O.alt(function () { return O.some(text); })); }));
    }));
};
/**
 * Get the module name of this NamedImports.
 */
exports.extractModuleNameFromNamedImports = function (ni) {
    return pipeable_1.pipe(ni.parent.parent.moduleSpecifier, exports.extract(ts.isStringLiteral), O.map(exports.access("text")));
};
function isTypeAssignableTo(checker, source, target) {
    return checker.isTypeAssignableTo(source, target);
}
exports.isTypeAssignableTo = isTypeAssignableTo;
exports.typeEq = function (ch) { return ({
    equals: function (a, b) { return isTypeAssignableTo(ch, a, b) && isTypeAssignableTo(ch, b, a); }
}); };
exports.access = function (key) { return function (o) { return o[key]; }; };
exports.tap = function (f) { return function (a) {
    f(a);
    return a;
}; };
exports.log = function (s) { return exports.tap(function (a) { return console.log(s); }); };
exports.logIt = function (s) { return exports.tap(function (a) { return console.log(s, a); }); };
exports.logWith = function (s, f) { return exports.tap(function (a) { return console.log(s, f(a)); }); };
