import { Deriver } from './deriver';
import { array } from 'fp-ts/lib/Array';
import { extract, access, symbolMatches, typeEq, logIt, logWith } from './utils';
import { Do } from "fp-ts-contrib/lib/Do";
import * as ts from "typescript";
import * as D from "./derivate";
import * as O from "fp-ts/lib/Option";
import * as A from 'fp-ts/lib/Array';
import { pipe } from "fp-ts/lib/pipeable";
import { flow } from "fp-ts/lib/function";
import * as E from 'fp-ts/lib/Either';
import { typeFlagToName } from './syntaxKind';
import { match } from './adt';
import { matchType, propFold } from './helpers';

const JSDocTagName = "implied";
const FuncName = "__derive";
const ModuleName = "./derive";

const accessT = (s: string): D.Derivate<ts.PropertyAccessExpression> =>
  D.of(ts.createPropertyAccess(
    ts.createIdentifier('t'),
    ts.createIdentifier(s)
  ))

const callT = (s: string): ((...args: ts.Expression[]) => D.Derivate<ts.CallExpression>) =>
  (...args) => pipe(
    accessT(s),
    D.map(str => ts.createCall(
      str,
      undefined,
      args
    ))
  )

const expressionBuilder = (
  type: ts.Type,
  advance: (t: ts.Type, step: D.ContextStep) => D.Derivate<ts.Expression>
): D.Derivate<ts.Expression> =>
  matchType<D.Derivate<ts.Expression>>({
    stringLiteral: str => callT('literal')(ts.createStringLiteral(str.value)),
    string: () => accessT('string'),
    numberLiteral: num => callT('literal')(ts.createLiteral(num.value)),
    number: () => accessT('number'),
    void: () => accessT('void'),
    unknown: () => accessT('unknown'),
    any: () => accessT('any'),
    booleanLiteral: bool => callT('literal')(ts.createLiteral(bool.value)),
    boolean: () => accessT('boolean'),
    union: u => pipe(
      array.traverse(D.derivate)(u.types, t => advance(t, {_type: 'lazy'})),
      D.map(ts.createArrayLiteral),
      D.chain(callT('union'))
    ),
    intersection: i => pipe(
      array.traverse(D.derivate)(i.types, t => advance(t, {_type: 'lazy'})),
      D.map(ts.createArrayLiteral),
      D.chain(callT('union'))
    ),
  
    class: t => D.error({_type: 'UnsupportedType', type: t.type, label: "classes ain't supported" }),
    // todo: hmm
    // generic: { type: ts.Type, parameters: ts.Type[] },
    function: () => accessT('Function'),
    struct: ({extract}) =>
      D.askM(({checker}) => 
        pipe(
          extract(checker),
          ({props}) => array.traverse(D.derivate)(props, propFold({
            method: (name) => pipe(
              accessT('function'),
              D.map(acc => ts.createPropertyAssignment(name, acc))
            ),
            property: (name, t) => {
              console.log('advancing from: ', type.getProperties().map(a => a.name), 'to', type.getProperties().map(a => a.name));
               return pipe(
              
              advance(t, {_type: 'prop', name }),
              D.map(acc => ts.createPropertyAssignment(name, acc))
            ) }
          })),
          D.map(ts.createObjectLiteral),
          D.chain(callT('struct'))
        )
      ),
    
    // s => accessT('woo!'),
    
  
    default: () => D.error({_type: 'Exception', message: 'sent to "default" matcher' })
  })(type)

export const IoTsDeriver: Deriver = {
  expressionBuilder,
  symbolRepresentsTcForType: (symbol, type) =>
    Do(D.derivate)
      .bind('checker', D.ask(a => a.checker))
      .bind('rootNode', D.ask(a => a.deriveNode))
      .bindL('represents', ({checker, rootNode}) => {
        
        const typ = pipe(
          O.tryCatch(() => checker.getTypeOfSymbolAtLocation(symbol, rootNode))
        )
        const matches = pipe(
          typ,
          O.chain(t => O.fromNullable(t.symbol)),
          O.chain(s => O.fromNullable(s.declarations)),
          O.chain(A.head),
          O.chain(O.fromNullable),
          O.map(access('parent')),
          O.chain(extract(ts.isSourceFile)),
          O.map(a => a.fileName.endsWith('io-ts/lib/index.d.ts')),
          O.map(matches => matches && 
            pipe( // todo: should this be handle by derivate?
              symbol.getJsDocTags(),
              A.findFirst(tag => tag.name === JSDocTagName),
              O.isSome
            )
          ),
          O.getOrElse(() => false)
        )
        if(matches) {

          // get jsdoc annotations
          // console.log('MATCHED', symbol.name)
          return pipe(
            typ,
            O.chain(t => O.tryCatch(() => checker.getTypeArguments(t as ts.TypeReference) as ts.Type[])),
            O.chain(A.head),
            O.map(t => typeEq(checker).equals(t, type)),
            O.getOrElse(() => false),
            D.of
          )

        } else {
          return D.of(false);
        }
      })
      .return(p => p.represents)
    // return D.of(false);
  ,
  extractor: node =>
    pipe(
      D.deriver,
      D.map(({ context: { checker } }) =>
        Do(O.option)
          .bind("ce", extract(ts.isCallExpression)(node))
          .bindL("matches", flow(
            access('ce'),
            access('expression'),
            checker.getSymbolAtLocation,
            O.fromNullable,
            O.map(symbolMatches(FuncName, ModuleName)),
            O.chain(matches => matches ? O.some(matches) : O.none)
          ))
          .bindL(
            "type",
            flow(
              access("ce"),
              access("typeArguments"),
              O.fromNullable,
              O.map(args => args[0]),
              O.chain(O.fromNullable),
              O.map(checker.getTypeFromTypeNode)
            )
          )
          .return(({ ce, type }) => {
            console.log("found!");
            console.log("  call expression:", ce.getText());
            console.log("  extracted type :", type.symbol.escapedName);
            return type;
          })
      )
    )
}
