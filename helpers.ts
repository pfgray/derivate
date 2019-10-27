import * as ts from "typescript";
import * as O from "fp-ts/lib/Option";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/pipeable";
import { toArray, access } from "./utils";
import { ADT } from "./adt";
import { symbolFlagToName } from "./syntaxKind";
import { checkServerIdentity } from "tls";
import { flow, identity } from "fp-ts/lib/function";

type MatchTypes = {
  stringLiteral: { value: string };
  string: undefined;
  numberLiteral: { value: number };
  number: undefined;
  void: undefined;
  unknown: undefined;
  any: undefined;
  booleanLiteral: { value: boolean };
  boolean: undefined;
  union: { types: ts.Type[] };
  intersection: { types: ts.Type[] };

  class: { type: ts.InterfaceType };
  // todo: hmm
  // generic: { type: ts.Type, parameters: ts.Type[] },
  function: { arguments: ts.Type[]; returnType: ts.Type };

  // todo: this is just, ugh... 
  struct: { extract: (checker: ts.TypeChecker, source: ts.SourceFile) => ({ props: Property[] }) };

  default: undefined;
};

export type Prop = { name: string; type: ts.Type };

export type Property = ADT<{
  method: { name: string, parameters: ts.Type[]; returnType: ts.Type },
  property: { name: string, type: ts.Type };
}>;

const property = (name: string, type: ts.Type): Property =>
  ({name, type, _type: 'property'})

const meth = (name: string, parameters: ts.Type[] , returnType: ts.Type): Property =>
  ({name, returnType, parameters, _type: 'method'})

export const propFold = <Z>(m: {
  method: (name: string, params: ts.Type[], ret: ts.Type) => Z,
  property: (name: string, type: ts.Type) => Z 
}): ((t: Property) => Z) => t => {
  if(t._type === 'method') {
    return m.method(t.name, t.parameters, t.returnType);
  } else {
    return m.property(t.name, t.type);
  }
}

type Matchers<Z> = { [K in keyof MatchTypes]: (arg: MatchTypes[K]) => Z };

// function matchTypeI(t: ts.Type): <Z>(m: Matchers<Z>) => Z {
//   return matchers
// }

const tap = <A>(f: (a:A) => void): ((a: A) => A) =>
  a => { f(a); return a };

export const matchType = <Z>(m: Matchers<Z>): ((t: ts.Type) => Z) => t => {
  if (t.isStringLiteral()) {
    return m.stringLiteral(t);
  } else if (t.flags === ts.TypeFlags.String) {
    return m.string(undefined);
  } else if (t.isNumberLiteral()) {
    return m.numberLiteral(t);
  } else if (t.flags === ts.TypeFlags.Number) {
    return m.number(undefined);
  } else if (t.flags === ts.TypeFlags.Void) {
    return m.void(undefined);
  } else if (t.flags === ts.TypeFlags.Unknown) {
    return m.unknown(undefined);
  } else if (t.flags === ts.TypeFlags.Any) {
    return m.any(undefined);
  } else if (t.flags === ts.TypeFlags.BooleanLiteral && t.isLiteral()) {
    console.log("GOT: ", t.value);
    return m.booleanLiteral({ value: (t.value as any) as boolean }); // todo: is this safe???
  } else if (t.flags === ts.TypeFlags.Boolean) {
    return m.boolean(undefined);
  } else if (t.flags === ts.TypeFlags.Enum) {
    return m.default(undefined);
  } else if (t.isUnion()) {
    return m.union(t);
  } else if (t.isIntersection()) {
    return m.intersection(t);
  } else if (t.isClassOrInterface()) {
    return m.class({ type: t });
    //return D.error(unsupportedType(t, 'Class: ' + t.getSymbol()!.escapedName.toString()));
  } else {
    // TODO: this is kinda whack and needs some review, is there a better way?
    // defaulting to struct
    return m.struct({ extract: (checker, source) => ({
      props: pipe(
        t.getProperties(),
        A.chain<ts.Symbol, Property>(prop => {
          // declare const checker: ts.TypeChecker;
          //checker.getTypeFromTypeNode()

          const dec = prop.valueDeclaration;
          
          if (!dec) {
            return [];
          } else if (ts.isPropertySignature(dec)) {
            return pipe(
              dec.type,
              O.fromNullable,
              O.map(tap(a => {
                const printer = ts.createPrinter({
                  newLine: ts.NewLineKind.LineFeed
                });
                console.log('Got typenode!!!')
                console.log(printer.printNode(ts.EmitHint.Unspecified, a, source))
              })),
              O.map(checker.getTypeFromTypeNode),
              O.map(typ => property(dec.name.getText(), typ)),
              toArray
            )
          } else if (ts.isMethodSignature(dec)) {
            
            const params = pipe(
              dec.parameters.map(identity),
              A.chain(flow(access('type'), O.fromNullable, toArray)),
              A.map(checker.getTypeFromTypeNode)
            )
            return pipe(
              dec.type,
              O.fromNullable,
              O.map(checker.getTypeFromTypeNode),
              O.map(t => meth(dec.name.getText(), params, t)),
              toArray
            )
          } else {
            return [];
          }
        })
      )
    })});
  }
};
