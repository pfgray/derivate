import * as ts from 'typescript';
import { Option, some, none, fold, map, option } from 'fp-ts/lib/Option';
import { findFirst, zipWith, zip, range, chain } from 'fp-ts/lib/Array';
import { Do } from 'fp-ts-contrib/lib/Do';
import { pipe } from 'fp-ts/lib/pipeable'
import { toName } from './syntaxKind';
import { Either, left, right, isLeft } from 'fp-ts/lib/Either';
import { IoType, ioNumber, ioString, ioUnion, ioIntersection, ioImpossible, ioStruct, Prop, ioStringLit, print, typeToExpression } from './ioTsTypes';

enum Console {
  Reset = "\x1b[0m",
  Bright = "\x1b[1m",
  Dim = "\x1b[2m",
  Underscore = "\x1b[4m",
  Blink = "\x1b[5m",
  Reverse = "\x1b[7m",
  Hidden = "\x1b[8m",

  FgBlack = "\x1b[30m",
  FgRed = "\x1b[31m",
  FgGreen = "\x1b[32m",
  FgYellow = "\x1b[33m",
  FgBlue = "\x1b[34m",
  FgMagenta = "\x1b[35m",
  FgCyan = "\x1b[36m",
  FgWhite = "\x1b[37m",

  BgBlack = "\x1b[40m",
  BgRed = "\x1b[41m",
  BgGreen = "\x1b[42m",
  BgYellow = "\x1b[43m",
  BgBlue = "\x1b[44m",
  BgMagenta = "\x1b[45m",
  BgCyan = "\x1b[46m",
  BgWhite = "\x1b[47m",
}

function typeNodeToType(checker: ts.TypeChecker, program: ts.Program): (node: Either<ts.TypeNode, ts.Type>) => IoType {
  return node => {
    const typ = isLeft(node) ? checker.getTypeFromTypeNode(node.left) : node.right;

    if(isLeft(node) && node.left.getText() === 'number') {
      return ioNumber;
    } else if(isLeft(node) && node.left.getText() === 'string') {
      return ioString;
    } else if(typ.isUnion()) {
      return ioUnion(typeNodeToType(checker, program)(right(typ.types[0])), typeNodeToType(checker, program)(right(typ.types[1])));
    } else if(typ.isIntersection()) {
      return ioIntersection(typeNodeToType(checker, program)(right(typ.types[0])), typeNodeToType(checker, program)(right(typ.types[1])));
    } else if(typ.isStringLiteral()){
      return ioStringLit(typ.value)
    } else {
      // defaulting to struct
      // checker.getTyp
      // if(typ.aliasSymbol) {
      //   const name = checker.getFullyQualifiedName(typ.aliasSymbol)
      //   const parsedFileName = JSON.parse(name.split(".")[0])
      //   console.log('parsed:', parsedFileName)
      //   console.log('defined in: ', program.getSourceFile(parsedFileName + ".ts").fileName)
      // }

      const props: Prop[] = typ.getProperties().map(prop => {
        if(prop.declarations.length > 0) {
          const prrr = prop.declarations.map(d => {
            return ts.isPropertySignature(d) ? toProp(checker, program)(d) : null as Prop
          })
          if(prrr.length > 1){
            console.log('computed more than one: ', prrr)
          }
          return prrr[0];
        } else if(ts.isPropertySignature(prop.valueDeclaration)) {
          return toProp(checker, program)(prop.valueDeclaration)
        } else {
          console.log('having lots of trouble determing:', prop.getName());
          return { name: prop.getName(), type: ioImpossible } as Prop
        }
      })

      const foo = ioStruct(...props)
      
      return foo as any; // wat
    }
  }
}

function toProp(checker: ts.TypeChecker, program: ts.Program): (propSig: ts.PropertySignature) => Prop {
  return propSig => ({
    name: propSig.name.getText(),
    type: typeNodeToType(checker, program)(left(propSig.type))
  })
}

export function deriveTransformer<T extends ts.Node>(checker: ts.TypeChecker, program: ts.Program): ts.TransformerFactory<T> {
  return context => {
    
    const visit: ts.Visitor = node => {
      return pipe(
        extractDeriveCall(checker)(node),
        map(d => ({
          ...d,
          typ: typeNodeToType(checker, program)(left(d.type))
        })),
        fold(
          () => ts.visitEachChild(node, child => visit(child), context),
          info => {
            // console.log('For derive call: ', info.fullText)
            // console.log(print(info.typ))
            // console.log('----')

            // checker.symbolToExpression()
            // ts.createCall()
            return typeToExpression(info.typ)
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
    ).return(({call}) => {
      console.log('got call... ')
      console.log('-------------------')
      return ({type: call.typeArguments[0], fullText: call.getFullText()})
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
