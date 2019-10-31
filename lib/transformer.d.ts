import { Hood } from './utils/hood';
import * as D from "./derivate";
import * as ts from "typescript";
import * as O from "fp-ts/lib/Option";
import { Deriver } from "./deriver";
export declare type Extractor = (node: ts.Node) => D.Derivate<O.Option<ts.Type>>;
/**
 * Get the _real_ (or, 'original') name of the first named import
 * in this NamedImports.
 */
export declare const extractNameFromNamedImports: (ni: ts.NamedImports) => O.Option<string>;
export declare function testTransformer<T extends ts.Node>(checker: ts.TypeChecker, program: ts.Program, source: ts.SourceFile, deriver: Deriver): ts.TransformerFactory<T>;
export declare const printHood: (separator: string, print: (t: ts.Type) => string) => (h: Hood<ts.Type>) => string;
export declare const indentTo: (n: number, s: string) => string;
