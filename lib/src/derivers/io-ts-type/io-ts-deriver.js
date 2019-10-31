"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Do_1 = require("fp-ts-contrib/lib/Do");
var A = require("fp-ts/lib/Array");
var Array_1 = require("fp-ts/lib/Array");
var function_1 = require("fp-ts/lib/function");
var O = require("fp-ts/lib/Option");
var pipeable_1 = require("fp-ts/lib/pipeable");
var ts = require("typescript");
var D = require("../../derivate");
var helpers_1 = require("../../utils/helpers");
var hood_1 = require("../../utils/hood");
var compilerUtils_1 = require("../../utils/compilerUtils");
var JSDocTagName = "implied";
var FuncName = "__derive";
var ModuleName = "./derive";
var accessT = function (s) {
    return D.of(ts.createPropertyAccess(ts.createIdentifier("t"), ts.createIdentifier(s)));
};
var callT = function (s) { return function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return pipeable_1.pipe(accessT(s), D.map(function (str) { return ts.createCall(str, undefined, args); }));
}; };
var expressionBuilder = function (type, advance) {
    return helpers_1.matchType({
        stringLiteral: function (str) { return callT("literal")(ts.createStringLiteral(str.value)); },
        string: function () { return accessT("string"); },
        numberLiteral: function (num) { return callT("literal")(ts.createLiteral(num.value)); },
        number: function () { return accessT("number"); },
        void: function () { return accessT("void"); },
        unknown: function () { return accessT("unknown"); },
        any: function () { return accessT("any"); },
        booleanLiteral: function (bool) { return callT("literal")(ts.createLiteral(bool.value)); },
        boolean: function () { return accessT("boolean"); },
        union: function (u) {
            return pipeable_1.pipe(hood_1.splay(u.types), function (hoods) {
                return Array_1.array.traverse(D.derivate)(hoods, function (hood) {
                    return advance(hood.focus, {
                        _type: "union",
                        hood: hood
                    });
                });
            }, D.map(ts.createArrayLiteral), D.chain(callT("union")));
        },
        intersection: function (i) {
            return pipeable_1.pipe(hood_1.splay(i.types), function (hoods) {
                return Array_1.array.traverse(D.derivate)(hoods, function (hood) {
                    return advance(hood.focus, {
                        _type: "intersection",
                        hood: hood
                    });
                });
            }, D.map(ts.createArrayLiteral), D.chain(callT("union")));
        },
        class: function (t) {
            return D.error({
                _type: "UnsupportedType",
                type: t.type,
                label: "classes ain't supported"
            });
        },
        interface: function (t) {
            return D.error({
                _type: "UnsupportedType",
                type: t.type,
                label: "interfaces ain't supported"
            });
        },
        // todo: hmm
        // generic: { type: ts.Type, parameters: ts.Type[] },
        function: function () { return accessT("Function"); },
        struct: function (_a) {
            var extract = _a.extract;
            return D.askM(function (_a) {
                var checker = _a.checker, source = _a.source;
                return pipeable_1.pipe(extract(checker, source), function (_a) {
                    var props = _a.props;
                    return Array_1.array.traverse(D.derivate)(props, helpers_1.propFold({
                        method: function (name) {
                            return pipeable_1.pipe(accessT("function"), D.map(function (acc) { return ts.createPropertyAssignment(name, acc); }));
                        },
                        property: function (name, t) {
                            return pipeable_1.pipe(advance(t, { _type: "prop", name: name, type: t }), D.map(function (acc) { return ts.createPropertyAssignment(name, acc); }));
                        }
                    }));
                }, D.map(ts.createObjectLiteral), D.chain(callT("struct")));
            });
        },
        default: function () {
            return D.error({ _type: "Exception", message: 'sent to "default" matcher' });
        }
    })(type);
};
exports.IoTsDeriver = {
    expressionBuilder: expressionBuilder,
    symbolRepresentsTcForType: function (symbol, type) {
        return Do_1.Do(D.derivate)
            .bind("checker", D.ask(function (a) { return a.checker; }))
            .bind("rootNode", D.ask(function (a) { return a.deriveNode; }))
            .bindL("represents", function (_a) {
            var checker = _a.checker, rootNode = _a.rootNode;
            var typ = pipeable_1.pipe(O.tryCatch(function () { return checker.getTypeOfSymbolAtLocation(symbol, rootNode); }));
            var matches = pipeable_1.pipe(typ, O.chain(function (t) { return O.fromNullable(t.symbol); }), O.chain(function (s) { return O.fromNullable(s.declarations); }), O.chain(A.head), O.chain(O.fromNullable), O.map(compilerUtils_1.access("parent")), O.chain(compilerUtils_1.extract(ts.isSourceFile)), O.map(function (a) { return a.fileName.endsWith("io-ts/lib/index.d.ts"); }), O.map(function (matches) {
                return matches &&
                    pipeable_1.pipe(
                    // todo: should this be handle by derivate?
                    symbol.getJsDocTags(), A.findFirst(function (tag) { return tag.name === JSDocTagName; }), O.isSome);
            }), O.getOrElse(function () { return false; }));
            if (matches) {
                // get jsdoc annotations
                // console.log('MATCHED', symbol.name)
                return pipeable_1.pipe(typ, O.chain(function (t) {
                    return O.tryCatch(function () {
                        return checker.getTypeArguments(t);
                    });
                }), O.chain(A.head), O.map(function (t) { return compilerUtils_1.typeEq(checker).equals(t, type); }), O.getOrElse(function () { return false; }), D.of);
            }
            else {
                return D.of(false);
            }
        })
            .return(function (p) { return p.represents; });
    },
    extractor: function (node) {
        return pipeable_1.pipe(D.deriver, D.map(function (_a) {
            var checker = _a.context.checker;
            return Do_1.Do(O.option)
                .bind("ce", compilerUtils_1.extract(ts.isCallExpression)(node))
                .bindL("matches", function_1.flow(compilerUtils_1.access("ce"), compilerUtils_1.access("expression"), checker.getSymbolAtLocation, O.fromNullable, O.map(compilerUtils_1.symbolMatches(FuncName, ModuleName)), O.chain(function (matches) { return (matches ? O.some(matches) : O.none); })))
                .bindL("type", function_1.flow(compilerUtils_1.access("ce"), compilerUtils_1.access("typeArguments"), O.fromNullable, O.map(function (args) { return args[0]; }), O.chain(O.fromNullable), O.map(checker.getTypeFromTypeNode)))
                .return(function (_a) {
                var ce = _a.ce, type = _a.type;
                // console.log("found!");
                // console.log("  call expression:", ce.getText());
                // console.log("  extracted type :", type.symbol.escapedName);
                return type;
            });
        }));
    }
};
