"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var compilerUtils_1 = require("./utils/compilerUtils");
var Do_1 = require("fp-ts-contrib/lib/Do");
var D = require("./derivate");
var ts = require("typescript");
var O = require("fp-ts/lib/Option");
var E = require("fp-ts/lib/Either");
var A = require("fp-ts/lib/Array");
var pipeable_1 = require("fp-ts/lib/pipeable");
var function_1 = require("fp-ts/lib/function");
var monocle_ts_1 = require("monocle-ts");
var helpers_1 = require("./utils/helpers");
var console_1 = require("./utils/console");
var toArray = function (o) { return (O.isSome(o) ? [o.value] : []); };
/**
 * Get the _real_ (or, 'original') name of the first named import
 * in this NamedImports.
 */
exports.extractNameFromNamedImports = function (ni) {
    return pipeable_1.pipe(O.fromNullable(ni.elements[0]), O.map(function (el) {
        return pipeable_1.pipe(O.fromNullable(el.propertyName), O.map(function (prop) { return prop.text; }), O.getOrElse(function () { return el.name.text; }));
    }));
};
var searchScope = function (rootLocation, deriver) { return function (t) {
    return D.askM(function (_a) {
        var checker = _a.checker;
        return pipeable_1.pipe(checker.getSymbolsInScope(rootLocation, ts.SymbolFlags.Value), 
        // todo: this next step could probably short circuit, instead of searching all...
        function (symbols) {
            return A.array.traverse(D.derivate)(symbols, function (symbol) {
                return pipeable_1.pipe(deriver.symbolRepresentsTcForType
                    ? deriver.symbolRepresentsTcForType(symbol, t)
                    : D.of(false), D.map(function (isGood) { return (isGood ? O.some(symbol) : O.none); }));
            });
        }, D.map(function_1.flow(A.chain(function (a) { return toArray(a); }), A.head, O.map(function (symbol) { return ts.createIdentifier(symbol.getName()); }))));
    });
}; };
var findType = function (t) { return function (types) {
    return D.ask(function (_a) {
        var checker = _a.checker;
        return pipeable_1.pipe(types, A.findFirst(function (_a) {
            var type = _a.type;
            return compilerUtils_1.isTypeAssignableTo(checker, type, t) &&
                compilerUtils_1.isTypeAssignableTo(checker, type, t);
        }));
    });
}; };
var findInResolved = function (t) {
    return pipeable_1.pipe(D.get, D.map(function_1.flow(compilerUtils_1.access("queries"), compilerUtils_1.access("resolved"))), D.chain(findType(t)), D.map(O.map(function (found) {
        return found.expression;
    })));
};
var hasBeenQueried = function (t) {
    return pipeable_1.pipe(D.get, D.map(function_1.flow(compilerUtils_1.access("queries"), compilerUtils_1.access("queried"))), D.chain(findType(t)), D.map(O.isSome));
};
var queriedL = monocle_ts_1.Lens.fromPath()(["queries", "queried"]);
var resolvedL = monocle_ts_1.Lens.fromPath()(["queries", "resolved"]);
var addResolvedExpression = function (e, t) {
    return resolvedL.modify(function (resolutions) { return __spreadArrays(resolutions, [{ expression: e, type: t }]); });
};
/**
 * is it in resolved?
 *   is it already queried? then return an error
 *   add to queried
 * @param t
 */
var query = function (rootLocation, deriver) { return function (t) {
    return Do_1.Do(D.derivate)
        .sequenceS({
        resolved: findInResolved(t),
    })
        .do(D.modify(queriedL.modify(function (q) { return __spreadArrays(q, [{ type: t }]); })))
        .bindL("ret", function (_a) {
        var resolved = _a.resolved;
        return D.of(resolved);
    })
        .bind("search", searchScope(rootLocation, deriver)(t))
        .doL(function_1.flow(compilerUtils_1.access("search"), O.fold(
    // null is fine here, return is thrown out
    function () { return D.of(null); }, function (e) { return D.modify(addResolvedExpression(e, t)); })))
        .return(function (c) {
        return pipeable_1.pipe(c.search, O.alt(function () { return c.ret; }));
    });
}; };
function testTransformer(checker, program, source, deriver) {
    return function (context) {
        var visit = function (node) {
            var buildExpressionInner = function (t, queried, path) {
                return pipeable_1.pipe(queried, A.findFirst(function (q) { return compilerUtils_1.typeEq(checker).equals(q, t); }), O.fold(function () {
                    return Do_1.Do(D.derivate)
                        .bind("query", query(node, deriver)(t))
                        .bindL("expression", function (_a) {
                        var query = _a.query;
                        return pipeable_1.pipe(query, O.map(D.of), O.getOrElse(function () {
                            return deriver.expressionBuilder(t, function (nextType, step) {
                                return buildExpressionInner(nextType, __spreadArrays(queried, [t]), __spreadArrays(path, [step]));
                            });
                        }));
                    })
                        .return(compilerUtils_1.access("expression"));
                }, function (t) { return D.error(D.recursive(t, path)); }));
            };
            var programD = Do_1.Do(D.derivate)
                .bind("type", deriver.extractor(node))
                .bindL("expression", function (_a) {
                var type = _a.type;
                return pipeable_1.pipe(type, O.map(function (t) { return buildExpressionInner(t, [], []); }), O.option.sequence(D.derivate));
            })
                .return(compilerUtils_1.access("expression"));
            var result = programD({
                checker: checker,
                program: program,
                source: source,
                deriveNode: node
            })({ queries: { queried: [], resolved: [] } })[0];
            if (E.isLeft(result)) {
                var errMessage_1 = '';
                result.left.forEach(function (err) {
                    var pr = function (t) { return helpers_1.printType(checker, source)(t); };
                    if (err._type === 'RecursiveTypeDetected') {
                        errMessage_1 += 'Recursive type detected:\n';
                        err.path.map(function (path, i) {
                            if (path._type === "prop") {
                                return exports.indentTo(i + 1, "\u2514\u2500 " + console_1.red(path.name) + ": " + console_1.dim(pr(path.type)));
                            }
                            else if (path._type === 'intersection') {
                                return exports.indentTo(i + 1, "\u2514\u2500 " + exports.printHood('|', pr)(path.hood));
                            }
                            else if (path._type === 'union') {
                                return exports.indentTo(i + 1, "\u2514\u2500 " + exports.printHood('|', pr)(path.hood));
                            }
                        }).forEach(function (a) { return errMessage_1 += a + "\n"; });
                    }
                    else if (err._type === 'UnsupportedType') {
                        errMessage_1 += 'Unsupported type: ' + pr(err.type) + (" (" + err.label + ")");
                    }
                });
                throw new Error(errMessage_1);
            }
            else if (O.isSome(result.right)) {
                return result.right.value;
            }
            else {
                return ts.visitEachChild(node, function (child) { return visit(child); }, context);
            }
        };
        return function (node) { return ts.visitNode(node, visit); };
    };
}
exports.testTransformer = testTransformer;
exports.printHood = function (separator, print) {
    return function (h) { return ((h.left.length > 0 ? console_1.dim(h.left.map(print).join(" " + separator + " ") + (" " + separator + " ")) : '') +
        console_1.red(print(h.focus)) +
        (h.right.length > 0 ? console_1.dim(" " + separator + " " + h.right.map(print).join(" " + separator + " ")) : '')); };
};
exports.indentTo = function (n, s) {
    var str = '';
    for (var i = 0; i < n; i++) {
        str = str + ' ';
    }
    return str + s;
};
