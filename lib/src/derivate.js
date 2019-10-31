"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var Do_1 = require("fp-ts-contrib/lib/Do");
var E = require("fp-ts/lib/Either");
var NEA = require("fp-ts/lib/NonEmptyArray");
var pipeable_1 = require("fp-ts/lib/pipeable");
var R = require("fp-ts/lib/Reader");
var S = require("fp-ts/lib/State");
var Option_1 = require("fp-ts/lib/Option");
var adt_1 = require("./utils/adt");
var console_1 = require("./utils/console");
var function_1 = require("fp-ts/lib/function");
exports.printError = function (e) {
    return adt_1.match(e)({
        Exception: function (e) { return "Whoops, " + e.message; },
        UnsupportedType: function (e) { return "The type " + console_1.red(e.label) + " isn't supported for derivation."; },
        InvalidProp: function (e) { return "The property " + console_1.red(e.name) + " found didn't work out."; },
        UnableToFind: function (e) { return 'hmm!'; },
        RecursiveTypeDetected: function (e) { return 'recursive type!\n' + exports.printPathContext(e.path); }
    });
};
exports.printPathContext = function (p) {
    // const inner = (indent: number): string =>
    return p.map(function (path) { return adt_1.match(path)({
        prop: function (a) { return "" + console_1.red(a.name); },
        intersection: function (i) { return i.hood.left.map(function (b) { return console_1.dim(b.symbol.getName()); }).join(' & ') + " & " + i.hood.focus.symbol.getName() + " & " + i.hood.right.map(function (b) { return console_1.dim(b.symbol.getName()); }).join(' & '); },
        union: function (i) { return i.hood.left.map(function (b) { return console_1.dim(b.symbol.getName()); }).join(' | ') + " | " + i.hood.focus.symbol.getName() + " | " + i.hood.right.map(function (b) { return console_1.dim(b.symbol.getName()); }).join(' | '); },
    }); }).join('\n');
};
exports.recursive = function (type, path) { return ({ _type: 'RecursiveTypeDetected', type: type, path: path }); };
exports.exception = function (message) { return ({ _type: 'Exception', message: message }); };
exports.unsupportedType = function (type, label) { return ({ _type: 'UnsupportedType', type: type, label: label }); };
exports.URI = 'Derivate';
var neArraySemi = NEA.getSemigroup();
var eitherValidation = E.getValidation(neArraySemi);
/**
 * Applicative ap for Derivate
 * @param rseab
 * @param rsea
 */
var apD = function (rseab, rsea) {
    return function (context) {
        var seab = rseab(context);
        var sea = rsea(context);
        return function (state) {
            var _a = seab(state), eab = _a[0], state2 = _a[1];
            var _b = sea(state2), ea = _b[0], state3 = _b[1];
            return [eitherValidation.ap(eab, ea), state3];
        };
    };
};
/**
 * Monad point for Derivate
 * @param a
 */
exports.of = function (a) { return R.of(S.of(E.right(a))); };
/**
 * Functor map for Derivates
 * @param rsea
 * @param f
 */
var mapD = function (rsea, f) {
    return function (context) {
        var sea = rsea(context);
        return function (state) {
            var _a = sea(state), ea = _a[0], state2 = _a[1];
            return [eitherValidation.map(ea, f), state2];
        };
    };
};
/**
 * Monadic bind for Derivate
 * @param rsea
 * @param f
 */
var chainD = function (rsea, f) {
    return function (context) {
        var sea = rsea(context);
        return function (state) {
            var _a = sea(state), ea = _a[0], state2 = _a[1];
            if (E.isRight(ea)) {
                var rsefa = f(ea.right);
                var sefa = rsefa(context);
                var _b = sefa(state2), efa = _b[0], state3 = _b[1];
                return [efa, state3];
            }
            else {
                return [ea, state2];
            }
        };
    };
};
/**
 * Monad instance for Derivate
 */
exports.derivate = {
    URI: exports.URI,
    ap: apD,
    of: exports.of,
    map: mapD,
    chain: chainD
};
exports.ap = (_a = pipeable_1.pipeable(exports.derivate), _a.ap), exports.apFirst = _a.apFirst, exports.apSecond = _a.apSecond, exports.chain = _a.chain, exports.chainFirst = _a.chainFirst, exports.flatten = _a.flatten, exports.map = _a.map;
/**
 * Fail with the given error
 * @param err
 */
exports.error = function (err) { return R.of(S.of(E.left([err]))); };
/**
 * Retrieve the current value of state
 */
exports.get = R.of(function (state) { return [E.right(state), state]; });
/**
 * Replaces the current state value
 * @param s
 */
exports.put = function (s) {
    return R.of(function () { return [E.right(s), s]; });
};
/**
 * Modifies the current state value, using the given function
 * @param f
 */
exports.modify = function (f) {
    return R.of(function (state) { return pipeable_1.pipe(f(state), function (newState) { return [E.right(newState), newState]; }); });
};
/**
 * Retrieve the Context
 */
exports.askC = pipeable_1.pipe(R.ask(), R.map(function (c) { return S.of(E.right(c)); }));
/**
 * Retrieve some value from Context, using the provided selector function
 * @param f
 */
exports.ask = function (f) {
    return pipeable_1.pipe(R.ask(), R.map(function (c) { return S.of(E.right(f(c))); }));
};
/**
 * Retrieve some value from Context, chaining the returned value from
 * the provided selector function
 * @param f
 */
exports.askM = function (f) {
    return pipeable_1.pipe(R.ask(), R.chain(function (c) { return f(c); }));
};
/**
 * Converts an `Option<A>` value to a `Derivate<A>`, using the provided error
 * in the case that the option is `None`
 * @param ifNone
 */
exports.convert = function (ifNone) {
    return function (op) { return Option_1.isNone(op) ? exports.error(ifNone) : exports.of(op.value); };
};
/**
 * Retrieve the Context and current State
 */
exports.deriver = Do_1.Do(exports.derivate)
    .sequenceS({
    context: exports.ask(function_1.identity),
    state: exports.get
}).done();
