import * as A from "fp-ts/lib/Array";
import { flow, identity } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { isTypeFlagSet } from 'tsutils';
import * as ts from "typescript";
import { ADT } from "ts-adt";
import { access, toArray, isGeneric } from "./compilerUtils";
import { monoidString } from "fp-ts/lib/Monoid";

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
  interface: { type: ts.InterfaceType };
  // todo: hmm
  // generic: { type: ts.Type, parameters: ts.Type[] },
  function: { arguments: ts.Type[]; returnType: ts.Type };

  // todo: this is just, ugh...
  struct: {
    extract: (
      checker: ts.TypeChecker,
      source: ts.SourceFile
    ) => { props: Property[] };
  };

  default: undefined;
};

export type Prop = { name: string; type: ts.Type };

export type Property = ADT<{
  method: { name: string; parameters: ts.Type[]; returnType: ts.Type };
  property: { name: string; type: ts.Type };
}>;

const property = (name: string, type: ts.Type): Property => ({
  name,
  type,
  _type: "property"
});

const meth = (
  name: string,
  parameters: ts.Type[],
  returnType: ts.Type
): Property => ({ name, returnType, parameters, _type: "method" });

export const propFold = <Z>(m: {
  method: (name: string, params: ts.Type[], ret: ts.Type) => Z;
  property: (name: string, type: ts.Type) => Z;
}): ((t: Property) => Z) => t => {
  if (t._type === "method") {
    return m.method(t.name, t.parameters, t.returnType);
  } else {
    return m.property(t.name, t.type);
  }
};

type Matchers<Z> = { [K in keyof MatchTypes]: (arg: MatchTypes[K]) => Z };

// function matchTypeI(t: ts.Type): <Z>(m: Matchers<Z>) => Z {
//   return matchers
// }

// const _tap = <A>(f: (a: A) => void): ((a: A) => A) => a => {
//   f(a);
//   return a;
// };

export const matchType = <Z>(m: Matchers<Z>): ((t: ts.Type) => Z) => t => {
  if (t.isStringLiteral()) {
    return m.stringLiteral(t);
  } else if (isTypeFlagSet(t, ts.TypeFlags.String)) {
    return m.string(undefined);
  } else if (t.isNumberLiteral()) {
    return m.numberLiteral(t);
  } else if (isTypeFlagSet(t, ts.TypeFlags.Number)) {
    return m.number(undefined);
  } else if (isTypeFlagSet(t, ts.TypeFlags.Void)) {
    return m.void(undefined);
  } else if (isTypeFlagSet(t, ts.TypeFlags.Unknown)) {
    return m.unknown(undefined);
  } else if (isTypeFlagSet(t, ts.TypeFlags.Any)) {
    return m.any(undefined);
  } else if (isTypeFlagSet(t, ts.TypeFlags.BooleanLiteral) && t.isLiteral() /*  */) {
    console.log("GOT boolean literal: ", t.value);
    return m.booleanLiteral({ value: (t.value as any) as boolean }); // todo: is this safe???
  } else if (isTypeFlagSet(t, ts.TypeFlags.Boolean)) {
    return m.boolean(undefined);
  } else if (isTypeFlagSet(t, ts.TypeFlags.Enum)) {
    return m.default(undefined);
  } else if (t.isUnion()) {
    return m.union(t);
  } else if (t.isIntersection()) {
    return m.intersection(t);
  } else if(t.isClass()) {
    return m.class({ type: t });
  } else if (t.isClassOrInterface()) {
    return m.interface({ type: t });
    //return D.error(unsupportedType(t, 'Class: ' + t.getSymbol()!.escapedName.toString()));
  } else {
    // TODO: this is kinda whack and needs some review, is there a better way?
    // defaulting to struct
    return m.struct({
      extract: (checker) => ({
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
                O.map(checker.getTypeFromTypeNode),
                O.map(typ => property(dec.name.getText(), typ)),
                toArray
              );
            } else if (ts.isMethodSignature(dec)) {
              const params = pipe(
                dec.parameters.map(identity),
                A.chain(
                  flow(
                    access("type"),
                    O.fromNullable,
                    toArray
                  )
                ),
                A.map(checker.getTypeFromTypeNode)
              );
              return pipe(
                dec.type,
                O.fromNullable,
                O.map(checker.getTypeFromTypeNode),
                O.map(t => meth(dec.name.getText(), params, t)),
                toArray
              );
            } else {
              return [];
            }
          })
        )
      })
    });
  }
};

export const printType = (
  checker: ts.TypeChecker,
  source: ts.SourceFile
): ((
  root: ts.Type,
) => string) => {
  const inner = (queried: ts.Type[], type: ts.Type): string => {
    if(isGeneric(type)._tag === "Some") {
      const symbol = type.aliasSymbol ? type.aliasSymbol.name : type.symbol.name
      return symbol + '<' +
        pipe(
          isGeneric(type),
          O.fold(() => [], A.map(t => t.getConstraint() ? "A extends " + inner([...queried, type], t.getConstraint()!) : "A")),
          a => a.join(", ")
        )
        + '>'   
    } else if (type.aliasSymbol) {
      return type.aliasSymbol.name;
    } else {
      const alreadyQueried = queried.find(t => t === type);
      if (alreadyQueried) {
        return "[recursive]";
      } else  {
        return matchType<string>({
          stringLiteral: str => `'${str.value}'`,
          string: () => "string",
          numberLiteral: num => num.value.toString(),
          number: () => "number",
          void: () => "void",
          unknown: () => "unknown",
          any: () => "any",
          booleanLiteral: bool => (bool.value ? "true" : "false"),
          boolean: () => "boolean",
          union: u => u.types.map(t => inner(queried, t)).join(" | "),
          intersection: i => i.types.map(t => inner(queried, t)).join(" & "),
          class: c => c.type.symbol.name,
          interface: c => c.type.symbol.name,
          function: () => "Function",
          struct: ({ extract }) => {
            const wut = extract(checker, source);
            const props = wut.props.map(
              propFold({
                method: () => "function",
                property: (name, t) =>
                  `${name}: ${inner([...queried, type], t)}`
              })
            );
            return `{ ${props.join(", ")} }`;
          },
          default: () => "hrm..."
        })(type);
      }
    }
  };
  return root => inner([], root);
};
