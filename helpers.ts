import * as ts from 'typescript';

type MatchTypes = {
  generic: {type: ts.Type, parameters: ts.Type[]},
  union: {types: ts.Type[]}
  intersection: {types: ts.Type[]},
  string: {},
  stringLiteral: { value: string },
  number: {},
  numberLiteral: { value: number },
  struct: {props: Prop[]},
  function: {arguments: ts.Type[], returnType: ts.Type}
  any: {}
}

export type Prop = { name: string, type: ts.Type }

type Matchers<Z> = {[K in keyof MatchTypes]: (arg: MatchTypes[K]) => Z };

// function matchTypeI(t: ts.Type): <Z>(m: Matchers<Z>) => Z {
//   return matchers
// }

declare const foo: ts.TypeNode;
declare const checker: ts.TypeChecker;

const match = <Z>(m: Matchers<Z>): ((t: ts.Type) => Z) => t => {
  if(ts.isTypeReferenceNode(foo)) {
  
  }
  t.isStringLiteral
}