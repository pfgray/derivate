"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var O = require("fp-ts/lib/Option");
var A = require("fp-ts/lib/Array");
var pipeable_1 = require("fp-ts/lib/pipeable");
var compilerUtils_1 = require("./compilerUtils");
var function_1 = require("fp-ts/lib/function");
var tsutils_1 = require("tsutils");
var property = function (name, type) { return ({
    name: name,
    type: type,
    _type: "property"
}); };
var meth = function (name, parameters, returnType) { return ({ name: name, returnType: returnType, parameters: parameters, _type: "method" }); };
exports.propFold = function (m) { return function (t) {
    if (t._type === "method") {
        return m.method(t.name, t.parameters, t.returnType);
    }
    else {
        return m.property(t.name, t.type);
    }
}; };
// function matchTypeI(t: ts.Type): <Z>(m: Matchers<Z>) => Z {
//   return matchers
// }
var tap = function (f) { return function (a) {
    f(a);
    return a;
}; };
exports.matchType = function (m) { return function (t) {
    if (t.isStringLiteral()) {
        return m.stringLiteral(t);
    }
    else if (tsutils_1.isTypeFlagSet(t, ts.TypeFlags.String)) {
        return m.string(undefined);
    }
    else if (t.isNumberLiteral()) {
        return m.numberLiteral(t);
    }
    else if (tsutils_1.isTypeFlagSet(t, ts.TypeFlags.Number)) {
        return m.number(undefined);
    }
    else if (tsutils_1.isTypeFlagSet(t, ts.TypeFlags.Void)) {
        return m.void(undefined);
    }
    else if (tsutils_1.isTypeFlagSet(t, ts.TypeFlags.Unknown)) {
        return m.unknown(undefined);
    }
    else if (tsutils_1.isTypeFlagSet(t, ts.TypeFlags.Any)) {
        return m.any(undefined);
    }
    else if (tsutils_1.isTypeFlagSet(t, ts.TypeFlags.BooleanLiteral) && t.isLiteral() /*  */) {
        console.log("GOT boolean literal: ", t.value);
        return m.booleanLiteral({ value: t.value }); // todo: is this safe???
    }
    else if (tsutils_1.isTypeFlagSet(t, ts.TypeFlags.Boolean)) {
        return m.boolean(undefined);
    }
    else if (tsutils_1.isTypeFlagSet(t, ts.TypeFlags.Enum)) {
        return m.default(undefined);
    }
    else if (t.isUnion()) {
        return m.union(t);
    }
    else if (t.isIntersection()) {
        return m.intersection(t);
    }
    else if (t.isClass()) {
        return m.class({ type: t });
    }
    else if (t.isClassOrInterface()) {
        return m.interface({ type: t });
        //return D.error(unsupportedType(t, 'Class: ' + t.getSymbol()!.escapedName.toString()));
    }
    else {
        // TODO: this is kinda whack and needs some review, is there a better way?
        // defaulting to struct
        return m.struct({
            extract: function (checker, source) { return ({
                props: pipeable_1.pipe(t.getProperties(), A.chain(function (prop) {
                    // declare const checker: ts.TypeChecker;
                    //checker.getTypeFromTypeNode()
                    var dec = prop.valueDeclaration;
                    if (!dec) {
                        return [];
                    }
                    else if (ts.isPropertySignature(dec)) {
                        return pipeable_1.pipe(dec.type, O.fromNullable, O.map(checker.getTypeFromTypeNode), O.map(function (typ) { return property(dec.name.getText(), typ); }), compilerUtils_1.toArray);
                    }
                    else if (ts.isMethodSignature(dec)) {
                        var params_1 = pipeable_1.pipe(dec.parameters.map(function_1.identity), A.chain(function_1.flow(compilerUtils_1.access("type"), O.fromNullable, compilerUtils_1.toArray)), A.map(checker.getTypeFromTypeNode));
                        return pipeable_1.pipe(dec.type, O.fromNullable, O.map(checker.getTypeFromTypeNode), O.map(function (t) { return meth(dec.name.getText(), params_1, t); }), compilerUtils_1.toArray);
                    }
                    else {
                        return [];
                    }
                }))
            }); }
        });
    }
}; };
exports.printType = function (checker, source) {
    var inner = function (queried, type) {
        if (type.aliasSymbol) {
            return type.aliasSymbol.name;
        }
        else {
            var alreadyQueried = queried.find(function (t) { return t === type; });
            if (alreadyQueried) {
                return "[recursive]";
            }
            else {
                return exports.matchType({
                    stringLiteral: function (str) { return "'" + str.value + "'"; },
                    string: function () { return "string"; },
                    numberLiteral: function (num) { return num.value.toString(); },
                    number: function () { return "number"; },
                    void: function () { return "void"; },
                    unknown: function () { return "unknown"; },
                    any: function () { return "any"; },
                    booleanLiteral: function (bool) { return (bool.value ? "true" : "false"); },
                    boolean: function () { return "boolean"; },
                    union: function (u) { return u.types.map(function (t) { return inner(queried, t); }).join(" | "); },
                    intersection: function (i) { return i.types.map(function (t) { return inner(queried, t); }).join(" & "); },
                    class: function (c) { return c.type.symbol.name; },
                    interface: function (c) { return c.type.symbol.name; },
                    function: function () { return "Function"; },
                    struct: function (_a) {
                        var extract = _a.extract;
                        var wut = extract(checker, source);
                        var props = wut.props.map(exports.propFold({
                            method: function () { return "function"; },
                            property: function (name, t) {
                                return name + ": " + inner(__spreadArrays(queried, [type]), t);
                            }
                        }));
                        return "{ " + props.join(", ") + " }";
                    },
                    default: function () { return "hrm..."; }
                })(type);
            }
        }
    };
    return function (root) { return inner([], root); };
};
