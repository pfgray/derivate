import { Eq } from 'fp-ts/lib/Eq';
import * as O from "fp-ts/lib/Option";
import * as ts from "typescript";
export declare const isStr: <K extends string>(k: K) => (s: string) => O.Option<K>;
export declare const toArray: <A>(a: O.Option<A>) => A[];
export declare const extract: <A extends ts.Node>(f: (u: ts.Node) => u is A) => (n: ts.Node) => O.Option<A>;
/**
 * Returns true if the symbol comes from the module specified, with
 * the specified name.
 *
 * Works with renamed imports
 *
 * @param name
 * @param moduleName
 */
export declare const symbolMatches: (name: string, moduleName: string) => (s: ts.Symbol) => boolean;
/**
 * Get the _real_ (or, 'original') name of the first named import
 * in this NamedImports.
 */
export declare const getOriginalNameFromNamedImports: (s: ts.Symbol, ni: ts.NamedImports) => O.Option<string>;
/**
 * Get the module name of this NamedImports.
 */
export declare const extractModuleNameFromNamedImports: (ni: ts.NamedImports) => O.Option<string>;
export declare function isTypeAssignableTo(checker: ts.TypeChecker, source: ts.Type, target: ts.Type): boolean;
export declare const typeEq: (ch: ts.TypeChecker) => Eq<ts.Type>;
declare type Access<O, K> = K extends keyof O ? O[K] : never;
export declare const access: <K extends string>(key: K) => <O extends object>(o: O) => Access<O, K>;
export declare const tap: <A>(f: (a: A) => void) => (a: A) => A;
export declare const log: (s: string) => <A>(a: A) => A;
export declare const logIt: (s: string) => <A>(a: A) => A;
export declare const logWith: <A>(s: string, f: (a: A) => unknown) => (a: A) => A;
export {};
