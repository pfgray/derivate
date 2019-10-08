import * as ts from "typescript"

/**
 * struct
 * tuple
 * intersection
 * union
 */

type BaseIoType = {
  type: ts.Type
}

export type IoType = BaseIoType & (IoString | IoStringLit | IoNumber | IoNumberLit | IoAny | IoStruct | IoUnion | IoIntersection)

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
    })
  }
  return inner(0, outer);
}

const indentTo = (n: number, s: string): string => {
  let str = '';
  for(var i = 0; i < n; i++) { str = str + ' ' }
  return str + s;
}

const accessT = (s: string): ts.PropertyAccessExpression =>
  ts.createPropertyAccess(
    ts.createIdentifier('t'),
    ts.createIdentifier(s)
  )

type Call = (...args: ts.Expression[]) => ts.CallExpression

const callT = (s: string): Call => 
  (...args) => ts.createCall(
    accessT(s),
    undefined,
    args
  )

export function typeToExpression(t: IoType): ts.Expression {
  return match(t)<ts.Expression>({
    string: i => accessT('string'),
    stringLit: i => callT('literal')(ts.createLiteral(`'${i.value}'`)),
    number: i => accessT('number'),
    numberLit: i => callT('literal')(ts.createLiteral(i.value)),
    any: i => accessT('unknown'),
    struct: i => callT('struct')(ts.createObjectLiteral(structToProperties(i), true)),
    union: i => callT('union')(ts.createArrayLiteral(i.types.map(typeToExpression))),
    intersection: i => callT('intersection')(ts.createArrayLiteral(i.types.map(typeToExpression))),
  })
}

export function structToProperties(i: IoStruct): ts.PropertyAssignment[] {
  return i.props.map(p => 
    ts.createPropertyAssignment(
      p.name,
      typeToExpression(p.type)
    )
  )
}
