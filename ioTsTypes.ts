import * as ts from "typescript"

export type IoType = IoString | IoNumber | IoAny | IoImpossible | IoStruct | IoUnion | IoIntersection | IoStringLit

export type IoString = {_type: 'string'}
export const ioString = {_type: 'string'}
export type IoStringLit = {_type: 'stringLit', value: string}
export const ioStringLit = (value: string): IoStringLit => ({ _type: 'stringLit', value })

export type IoNumber = {_type: 'number'}
export const ioNumber = {_type: 'number'}

export type IoAny = {_type: 'any'}
export const ioAny = {_type: 'any'}

export type IoImpossible = {_type: 'impossibru'}
export const ioImpossible = {_type: 'impossibru'}

export type IoStruct = {_type: 'struct', props: Prop[]}
export const ioStruct = (...props: Prop[]): IoStruct => ({ _type: 'struct', props })

export type IoUnion = {_type: 'union', left: IoType, right: IoType}
export const ioUnion = (left: IoType, right: IoType): IoUnion => ({ _type: 'union', left, right })

export type IoIntersection = {_type: 'intersection', left: IoType, right: IoType}
export const ioIntersection = (left: IoType, right: IoType): IoIntersection => ({ _type: 'intersection', left, right })

export type Prop = {name: string, type: IoType}
export const prop = (name: string, type: IoType): Prop => ({name, type})

type Matchers<Z> = {
  string: (i: IoString) => Z,
  stringLit: (i: IoStringLit) => Z,
  number: (i: IoNumber) => Z,
  any: (i: IoAny) => Z,
  impossible: (i: IoImpossible) => Z,
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
      case 'any': return m.any(t)
      case 'impossibru': return m.impossible(t)
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
      any: i => "any",
      impossible: i => "impossibru",
      struct: i => {
        return i.props.length === 0 ? '{}' : (
          `{\n${i.props.map(p => indentTo(indent + indentSize, p.name + ': ' + inner(indent + indentSize, p.type))).join('\n')}\n${indentTo(indent, '}')}`
        )
      },
      union: i => `${inner(indent, i.left)} | ${inner(indent, i.right)}`,
      intersection: i => `${inner(indent, i.left)} & ${inner(indent, i.right)}`,
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
    any: i => accessT('unknown'),
    impossible: i => accessT('unknown'),
    struct: i => callT('struct')(ts.createObjectLiteral(structToProperties(i), true)),
    union: i => callT('union')(ts.createArrayLiteral([typeToExpression(i.left), typeToExpression(i.right)])),
    intersection: i => callT('intersection')(ts.createArrayLiteral([typeToExpression(i.left), typeToExpression(i.right)])),
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

// {
// const wut = checker.getSymbolsInScope(start, ts.SymbolFlags.Value)

//     wut.forEach(s => {
//       if(s.escapedName === 'userC' || s.escapedName === 'lmao') {
        
//         console.log('Found symbol: ', s.escapedName)
//         console.log('  with type:', checker.getTypeOfSymbolAtLocation(s, start).symbol.getDeclarations()[0].getSourceFile().moduleName)
//         //  endsWith("/io-ts/lib/index.d.ts")
//       }
//     })
// }