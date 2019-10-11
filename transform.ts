import * as D from './derivate';
import { Derivate, unsupportedType, derivate, error, fromOption, ask } from './derivate';
import * as ts from 'typescript';
import { Option, some, none, fold, map, option, fromNullable } from 'fp-ts/lib/Option';
import { findFirst, zipWith, zip, range, chain } from 'fp-ts/lib/Array';
import { Do } from 'fp-ts-contrib/lib/Do';
import { pipe } from 'fp-ts/lib/pipeable'
import { toName, flagToName, symbolFlagToName } from './syntaxKind';
import * as E from 'fp-ts/lib/Either';
import { Either, left, right, isLeft } from 'fp-ts/lib/Either';
import { IoType, ioNumber, ioString, ioUnion, ioIntersection, ioStruct, Prop, ioStringLit, print, typeToExpression, ioNumberLit, IoFunction, ioFunction } from './ioTsTypes';
import * as S from 'fp-ts/lib/State';
import * as R from 'fp-ts/lib/Reader';
import * as O from 'fp-ts/lib/Option';
import { array } from 'fp-ts/lib/Array';
import { Console, red, cyan } from './console';
import { type } from 'os';
import { sequenceT } from 'fp-ts/lib/Apply';

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
          } else if(t.isClass()) {
            return D.error(unsupportedType(t, 'Class: ' + t.getSymbol()!.escapedName.toString()));
          } else if(t.isClassOrInterface()) {
            if(t.getConstructSignatures().length > 0) {
              return D.error(unsupportedType(t, 'Interface with constructor signatures: ' + t.getSymbol()!.escapedName.toString()));
            } else {
              return pipe(
                array.traverse(derivate)(t.getProperties(), prop => {
                  if(!prop.valueDeclaration) {
                    return D.error(D.exception(`valueDeclaration for prop: ${prop.getName()} doesn't exist!`))
                  } else if(ts.isPropertySignature(prop.valueDeclaration)) {
                    return toProp(prop.valueDeclaration);
                  } else if(ts.isMethodSignature(prop.valueDeclaration)) {
                    return toMethod(prop.valueDeclaration)
                  } else {
                    return D.error(D.exception(`Couldn't make heads or tails of this property? ${prop.getName()}`))
                  }
                }),
                D.map(props => ioStruct(props, t))
              );
            }
          } else {
            // defaulting to struct
            return pipe(
              array.traverse(derivate)(t.getProperties(), prop => {
                if(!prop.valueDeclaration) {
                  return D.error(D.exception(`valueDeclaration for prop: ${prop.getName()} doesn't exist!`))
                } else if(ts.isPropertySignature(prop.valueDeclaration)) {
                  return toProp(prop.valueDeclaration);
                } else if(ts.isMethodSignature(prop.valueDeclaration)) {
                  return toMethod(prop.valueDeclaration)
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
  toProperty(propSig.name.getText(), propSig.type)

const toProperty = (name: string, type?: ts.TypeNode) =>
  pipe(
    fromNullable(type),
    fromOption(D.exception(`Property: ${name} has no type`)),
    D.chain(typ => typeNodeToType(left(typ))),
    D.map(type => ({
      name: name,
      type
    }))
  )

const toMethod = (method: ts.MethodSignature): Derivate<Prop> =>
  Do(derivate)
    .bind('returnType', pipe(
      fromNullable(method.type),
      fromOption(D.exception(`Method: ${method.getFullText()} has no return type`)),
      D.chain(typeNode => ask(c => c.checker.getTypeFromTypeNode(typeNode)))
    ))
    .sequenceSL(({returnType}) => ({
      returnIoType: typeNodeToType(right(returnType)),
      parametersIoType: 
        array.traverse(derivate)(
          // unkown only needed because original is readonly 
          method.parameters as unknown as ts.ParameterDeclaration[],
          param => toProperty(param.name.getText(), param.type)
        )
    }))
    .return(({returnType, returnIoType, parametersIoType }) => ({
      name: method.name.getText(),
      type: ioFunction(parametersIoType, returnIoType, returnType)
    }))

export function deriveTransformer<T extends ts.Node>(checker: ts.TypeChecker, program: ts.Program): ts.TransformerFactory<T> {
  return context => {
    const visit: ts.Visitor = node => {
      return pipe(
        extractDeriveCall(checker)(node),
        O.fold(
          () => ts.visitEachChild(node, child => visit(child), context),
          d => {
            const [result, endState] = pipe(
              typeNodeToType(left(d.type)),
              D.chain(typeToExpression)
            )({checker, program, source: node.getSourceFile(), deriveNode: node })({resolvedTypes: []})
            if(isLeft(result)){

              const { line, character } = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart())
              
              throw new Error(
                `Error building instance for expression: ${red(node.getText())} defined in ${cyan(node.getSourceFile().fileName)}:${line}:${character}\n` +
                `\n` + 
                `${result.left.map(D.printError).join('\n')}\n`)

            } else {
              return result.right;
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

function resolveType(node: ts.TypeNode, t: ts.Type): Derivate<Option<ts.Expression>> {
  ask(({checker}) => {
    checker.getSymbolsInScope(node, ts.SymbolFlags.Value)
    
  })
  // isAssignable has _just_ been made "public":
  // https://github.com/microsoft/TypeScript/pull/33263/files#diff-c3ed224e4daa84352f7f1abcd23e8ccaR525-R527
}

// function isAssignableTo(source: ts.Type, target: ts.Type) {
// }
