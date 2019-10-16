import { Do } from 'fp-ts-contrib/lib/Do';
import * as D from './derivate';
import * as ts from 'typescript';
import { nodeFlagToName, typeFlagToName, syntaxKindtoName, symbolFlagToName } from './syntaxKind';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import { flow } from 'fp-ts/lib/function';
import { fromNullable } from 'fp-ts/lib/Either';
import { Type } from 'io-ts';


type Extractor = (node: ts.Node) => D.Derivate<O.Option<ts.Type>>


const extract = <A extends ts.Node>(f: (u: ts.Node) => u is A): ((n: ts.Node) => O.Option<A>) =>
  u => f(u) ? O.some(u) : O.none

type Access<O, K> = K extends keyof O ? O[K] : never;

const access = <K extends string>(key: K): (<O extends object>(o: O) => Access<O, K>) => o => (o as any)[key]

const tap = <A>(f: (a: A) => void): ((a: A) => A) =>
  a => { f(a); return a; }

const log = (s: string): (<A>(a: A) => A) =>
  tap(a => console.log(s, a))


const FuncName = '__derive';
const ModuleName = './derive';

const isStr = <K extends string>(k: K): ((s: string) => O.Option<K>) =>
  s => s === k ? O.some(s as K) : O.none

/**
 * Get the _real_ (or, 'original') name of the first named import 
 * in this NamedImports.
 */
const extractNameFromNamedImports = (ni: ts.NamedImports): O.Option<string> =>
  pipe(
    O.fromNullable(ni.elements[0]),
    O.map(el =>
      pipe(
        O.fromNullable(el.propertyName),
        O.map(prop => prop.text),
        O.getOrElse(() => el.name.text)
      )
    )
  )

const extractModuleNameFromNamedImports = (ni: ts.NamedImports): O.Option<string> =>
  pipe(
    ni.parent.parent.moduleSpecifier,
    extract(ts.isStringLiteral),
    O.map(access('text'))
  )       

const myExtractor: Extractor = node =>
  pipe(
    D.deriver,
    D.map(({context: {checker}}) =>
      Do(O.option)
        .bind('ce', extract(ts.isCallExpression)(node))
        .bindL('ni', ({ce}) =>
          pipe(
            ce.expression,
            extract(ts.isIdentifier),
            O.chain(n => O.fromNullable(checker.getSymbolAtLocation(n))),
            O.chain(s => O.fromNullable(s.declarations[0])),
            O.map(d => d.parent),
            O.chain(extract(ts.isNamedImports)),
          )
        )
        .bindL('functionName', flow(
          access('ni'),
          extractNameFromNamedImports,
          O.chain(isStr(FuncName))
        ))
        .bindL('moduleName', flow(
          access('ni'),
          extractModuleNameFromNamedImports,
          O.chain(isStr(ModuleName))
        ))
        .bindL('type', flow(
          access('ce'),
          access('typeArguments'),
          O.fromNullable,
          O.map(args => args[0]),
          O.chain(O.fromNullable),
          O.map(checker.getTypeFromTypeNode)
        ))
        .return(({ce, ni, type, functionName, moduleName}) => {
          console.log('found!')
          console.log('  call expression:', ce.getText())
          console.log('  function name  :', functionName)
          console.log('  module name    :', moduleName)
          
          console.log('  extracted type :', type.symbol.escapedName)
          return type;
        })
    )
  )

  // pipe(
  //   D.deriver,
  //   D.map(({context: {checker}}) => pipe(
  //     node,
  //     isTypeNode,
  //     O.map(checker.getTypeFromTypeNode),
  //     O.filter(tn => {
  //       const t = checker.getTypeOfSymbolAtLocation(tn.symbol, node)
  //       const name = checker.getFullyQualifiedName(t.symbol)
  //       name.endsWith()
  //     }),
  //   ))
  // )

const myTypeExpressor = (ts: Type)

export function testTransformer<T extends ts.Node>(checker: ts.TypeChecker, program: ts.Program, source: ts.SourceFile): ts.TransformerFactory<T> {
  // console.log(typeof (checker as any)["isTypeAssignableTo"] )
  return context => {
    const visit: ts.Visitor = node => {

      const result = myExtractor(node)({checker, program, source, deriveNode: null as any })({queries: {queried: [], resolved: []}})
      
      Do(D.derivate)
        .bind('type', myExtractor(node))
        .bind('expression', )
      
      
      // if(ts.isTypeNode(node) && node.parent.getFullText().indexOf('derive') !== -1 && node.getText() === 'User') {
      //   console.log('found typenode:', node.getText(), ts.getLineAndCharacterOfPosition(source, node.pos))
     
      //   const targetType = checker.getTypeFromTypeNode(node)
        
      //   const found = checker.getSymbolsInScope(node, ts.SymbolFlags.Value)
      //     .map(s => {

      //       if(s.getName() === 'userC'){
              
      //         const obj = { name: s.getName(), type: checker.getTypeOfSymbolAtLocation(s, node) }
      //         // console.log(checker.getAmbientModules().map(m => m.name))
              
      //         console.log('wuuut', checker.getFullyQualifiedName(obj.type.symbol))
              

      //         checker.getExportsOfModule


      //         // if(ts.isSourceFile(module)) {
      //         //   console.log('in file:')
      //         // }
      //         //console.log('export symbol:', obj.type.symbol.valueDeclaration.parent)

              
      //         return obj;
      //       } else {
      //         return {type: null}
      //       }
      //     })
      //     .find(({type}) => type ? isTypeAssignableTo(checker, type, targetType): false)

      //   checker.getTypeOfSymbolAtLocation

      //   if(found && found.type) {
      //     console.log('  Matched',printType(found.type), 'to:', printType(targetType))
      //   }
      // }
      return ts.visitEachChild(node, child => visit(child), context);
    };

    return node => ts.visitNode(node, visit);
  };
}

function isTypeAssignableTo(checker: ts.TypeChecker, source: ts.Type, target: ts.Type): boolean {
  return (checker as any).isTypeAssignableTo(source, target);
}

function printType(ts: ts.Type): string {
  if(ts.symbol) {
    return ts.symbol.getName()
  } else {

    return typeFlagToName(ts.flags)// "{ " + ts.getProperties().map(p => p.name).join(', ') + " }"
  }
}