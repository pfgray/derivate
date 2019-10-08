import * as D from './derivate';
import { Derivate, unsupportedType, derivate, Exception, fromOption } from './derivate';
import * as ts from 'typescript';
import { Option, some, none, fold, map, option, fromNullable } from 'fp-ts/lib/Option';
import { findFirst, zipWith, zip, range, chain } from 'fp-ts/lib/Array';
import { Do } from 'fp-ts-contrib/lib/Do';
import { pipe } from 'fp-ts/lib/pipeable'
import { toName } from './syntaxKind';
import * as E from 'fp-ts/lib/Either';
import { Either, left, right, isLeft } from 'fp-ts/lib/Either';
import { IoType, ioNumber, ioString, ioUnion, ioIntersection, ioStruct, Prop, ioStringLit, print, typeToExpression, ioNumberLit } from './ioTsTypes';
import * as S from 'fp-ts/lib/State';
import * as R from 'fp-ts/lib/Reader';
import { array } from 'fp-ts/lib/Array';
import { Console } from './console';

const typeNodeToType = (node: Either<ts.TypeNode, ts.Type>): Derivate<IoType> =>
  Do(derivate)
    .bind('context', D.ask(c => c))
    .bindL('type', ({context}) =>
      pipe(
        node,
        E.fold(
          tn => [some(tn), context.checker.getTypeFromTypeNode(tn)] as const,
          t => [none, t] as const
        ),
        ([tn, t]) => {
          if(t.flags === ts.TypeFlags.String){
            return D.of(ioString(t));
          } else if(t.isStringLiteral()){
            return D.of(ioStringLit(t.value, t))
          } else if(t.flags === ts.TypeFlags.Number) {
            return D.of(ioNumber(t));
          } else if(t.isNumberLiteral()){
            return D.of(ioNumberLit(t.value, t))
          } else if(t.flags === ts.TypeFlags.Void) {
            return D.error(unsupportedType(t, 'void'))
          } else if(t.flags === ts.TypeFlags.Unknown) {
            return D.error(unsupportedType(t, 'unknown'))
          } else if(t.isUnion()) {
            return pipe(
              array.sequence(derivate)(t.types.map(t => typeNodeToType(right(t)))),
              D.map(ts => ioUnion(ts, t))
            )
          } else if(t.isIntersection()) {
            return pipe(
              array.sequence(derivate)(t.types.map(t => typeNodeToType(right(t)))),
              D.map(ts => ioIntersection(ts, t))
            )
          } else {
            // defaulting to struct
            return pipe(
              array.traverse(derivate)(t.getProperties(), prop => {
                if(!prop.valueDeclaration) {
                  return D.error(D.exception(`valueDeclaration for prop: ${prop.getName()} doesn't exist!`))
                } else if(ts.isPropertySignature(prop.valueDeclaration)) {
                  return toProp(prop.valueDeclaration);
                } else {
                  return D.error(D.exception(`Couldn't make heads or tails of this property? ${prop.getName()}`))
                }
              }),
              D.map(props => ioStruct(props, t))
            )
          }
        }
      )
    )
    .return(({type}) => type)

const toProp = (propSig: ts.PropertySignature): Derivate<Prop> =>
  pipe(
    fromNullable(propSig.type),
    fromOption(D.exception(`Property signature: ${propSig.getFullText()} has no type`)),
    D.chain(typ => typeNodeToType(left(typ))),
    D.map(type => ({
      name: propSig.name.getText(),
      type
    }))
  )

export function deriveTransformer<T extends ts.Node>(checker: ts.TypeChecker, program: ts.Program): ts.TransformerFactory<T> {
  return context => {
    const visit: ts.Visitor = node => {
      return pipe(
        extractDeriveCall(checker)(node),
        map(d => {
          const [typ, {}] = typeNodeToType(left(d.type))({checker, program, source: d.type.getSourceFile(), deriveNode: d.type })({})
          
          return {
            ...d,
            typ
          }
        }),
        fold(
          () => ts.visitEachChild(node, child => visit(child), context),
          info => {
            // console.log('For derive call: ', info.fullText)
            // console.log(print(info.typ))
            // console.log('----')

            // checker.symbolToExpression()
            // ts.createCall()
            if(isLeft(info.typ)){
              throw "LOL"
            } else {
              return typeToExpression(info.typ.right)
            }
          }
        )
      )
      // don't return here, return the type Expression
      // return ts.visitEachChild(node, child => visit(child), context);
    };

    return node => ts.visitNode(node, visit);
  };
}

type DeriveInvocation = {
  type: ts.TypeNode,
  fullText: string
}

const convertExtractor: <A, AA extends A>(f: (a: A) => a is AA) => (a: A) => Option<AA> = 
  f => a => f(a) ? some(a) : none

const extracCallExpr = convertExtractor(ts.isCallExpression)

function extractDeriveCall(checker: ts.TypeChecker): (node: ts.Node) => Option<DeriveInvocation> {
  return node => Do(option)
    .bind('call', extracCallExpr(node))
    .bindL('identifier', ({call}) =>
      pipe(
        call.getChildren(),
        findFirst(c => ts.isIdentifier(c) && c.getFullText().trim() === '__derive'),
      )
    )
    .bindL('typeArgs', ({call}) => fromNullable(call.typeArguments))
    .bindL('typeArg', ({typeArgs}) => fromNullable(typeArgs[0]))
    .return(({call, typeArg}) => {
      console.log('got call... ')
      console.log('-------------------')
      return ({type: typeArg, fullText: call.getFullText()})
    })
}

function pr(label: string, thing: any) {
  console.log((label as any).padEnd(15, ' ') + ':', thing)
}

function padEnd(s: string, n: number, padding: string = ' ') {
  return (s as any).padEnd(n, padding)
}
function padStart(s: string, n: number, padding: string = ' ') {
  return (s as any).padStart(n, padding)
}
function sp(n: number, padding: string = ' '): string {
  let str = ''
  for(let i = 0; i < n; i++) {
    str += padding
  }
  return str;
}


const wrap = (c: Console) => (s: string) => c + s + Console.Reset
const cyan = wrap(Console.FgCyan)
const dim = wrap(Console.Dim)
const red = wrap(Console.FgRed)
const yellah = wrap(Console.FgYellow)
