import * as ts from "typescript"
import { Derivate } from "./derivate"
import * as D from './derivate'
import { Do } from "fp-ts-contrib/lib/Do"
import { pipe } from "fp-ts/lib/pipeable"
import { array } from "fp-ts/lib/Array"

/**
 * struct
 * tuple
 * intersection
 * union
 */

type BaseIoType = {
  type: ts.Type
}

export type IoType = BaseIoType & (IoString | IoStringLit | IoNumber | IoNumberLit | IoAny | IoStruct | IoUnion | IoIntersection | IoFunction)

export type IoString = {_type: 'string'}
export const ioString = (type: ts.Type): IoType => ({_type: 'string', type})
export type IoStringLit = {_type: 'stringLit', value: string}
export const ioStringLit = (value: string, type: ts.Type): IoType => ({ _type: 'stringLit', value, type })

export type IoNumber = {_type: 'number'}
export const ioNumber = (type: ts.Type): IoType => ({_type: 'number', type})
export type IoNumberLit = {_type: 'numberLit', value: number}
export const ioNumberLit = (value: number, type: ts.Type): IoType => ({ _type: 'numberLit', value, type })

export type IoAny = {_type: 'any'}
export const ioAny = (type: ts.Type): IoType => ({_type: 'any', type})

export type IoStruct = {_type: 'struct', props: Prop[]}
export const ioStruct = (props: Prop[], type: ts.Type): IoType => ({ _type: 'struct', props, type })

export type IoUnion = {_type: 'union', types: IoType[]}
export const ioUnion = (types: IoType[], type: ts.Type): IoType => ({ _type: 'union', types, type })

export type IoIntersection = {_type: 'intersection', types: IoType[]}
export const ioIntersection = (types: IoType[], type: ts.Type): IoType => ({ _type: 'intersection', types, type })

export type IoFunction = {_type: 'function', parameters: Prop[], returnType: IoType}
export const ioFunction = (parameters: Prop[], returnType: IoType, type: ts.Type): IoType => ({ _type: 'function', parameters, returnType, type })

export type Prop = { name: string, type: IoType }
export const prop = (name: string, type: IoType): Prop => ({name, type})

type Matchers<Z> = {
  string: (i: IoString) => Z,
  stringLit: (i: IoStringLit) => Z,
  number: (i: IoNumber) => Z,
  numberLit: (i: IoNumberLit) => Z,
  any: (i: IoAny) => Z,
  struct: (i: IoStruct) => Z,
  union: (i: IoUnion) => Z,
  intersection: (i: IoIntersection) => Z,
  function: (i: IoFunction) => Z,
}

function match(t: IoType): <Z>(m: Matchers<Z>) => Z {
  return m => {
    switch(t._type) {
      case 'string': return m.string(t)
      case 'stringLit': return m.stringLit(t)
      case 'number': return m.number(t)
      case 'numberLit': return m.numberLit(t)
      case 'any': return m.any(t)
      case 'struct': return m.struct(t)
      case 'union': return m.union(t)
      case 'intersection': return m.intersection(t)
      case 'function': return m.function(t)
    }
  }
}

export function print(outer: IoType, indentSize: number = 2): string {
  function inner(indent: number, typ: IoType): string {
    return match(typ)({
      string: i => "string",
      stringLit: i => `'${i.value}'`,
      number: i => "number",
      numberLit: i => i.value.toString(), 
      any: i => "any",
      struct: i => {
        return i.props.length === 0 ? '{}' : (
          `{\n${i.props.map(p => indentTo(indent + indentSize, p.name + ': ' + inner(indent + indentSize, p.type))).join('\n')}\n${indentTo(indent, '}')}`
        )
      },
      union: i => i.types.map(t => inner(indent, t)).join(' | ') ,
      intersection: i => i.types.map(t => inner(indent, t)).join(' & '),
      function: i => '(' + i.parameters.map((p, i) => p.name + ': ' + print(p.type, indentSize)) + ') => ' + print(i.returnType, indentSize)
    })
  }
  return inner(0, outer);
}

export const indentTo = (n: number, s: string): string => {
  let str = '';
  for(var i = 0; i < n; i++) { str = str + ' ' }
  return str + s;
}

const accessT = (s: string): Derivate<ts.PropertyAccessExpression> =>
  D.of(ts.createPropertyAccess(
    ts.createIdentifier('t'),
    ts.createIdentifier(s)
  ))

type Call = (...args: ts.Expression[]) => ts.CallExpression

const callT = (s: string): ((...args: ts.Expression[]) => Derivate<ts.CallExpression>) =>
  (...args) => pipe(
    accessT(s),
    D.map(str => ts.createCall(
      str,
      undefined,
      args
    ))
  )


export const typeToExpression = (t: IoType): Derivate<ts.Expression> =>
  match(t)<Derivate<ts.Expression>>({
    string: i => accessT('string'),
    stringLit: i => callT('literal')(ts.createLiteral(`'${i.value}'`)),
    number: i => accessT('number'),
    numberLit: i => callT('literal')(ts.createLiteral(i.value)),
    any: i => accessT('unknown'),
    struct: i => 
      pipe(
        structToProperties(i),
        D.map(ts.createObjectLiteral),
        D.chain(callT('struct'))
      ),
    union: i =>
      pipe(
        array.traverse(D.derivate)(i.types, typeToExpression),
        D.map(ts.createArrayLiteral),
        D.chain(callT('union'))
      ),
    intersection: i =>
      pipe(
        array.traverse(D.derivate)(i.types, typeToExpression),
        D.map(ts.createArrayLiteral),
        D.chain(callT('union'))
      ),
    function: i => accessT('Function')
  })

export const structToProperties = (i: IoStruct): Derivate<ts.PropertyAssignment[]> => 
  array.traverse(D.derivate)(i.props, p => 
    pipe(
      typeToExpression(p.type),
      D.map(typ => ts.createPropertyAssignment(p.name, typ))
    )
  )
