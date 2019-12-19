import { Do } from "fp-ts-contrib/lib/Do";
import * as A from "fp-ts/lib/Array";
import { array } from "fp-ts/lib/Array";
import { flow } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as ts from "typescript";
import * as D from "@derivate/core/lib/derivate";
import { Deriver } from "@derivate/core/lib/deriver";
import { matchType, propFold } from "@derivate/core/lib/utils/helpers";
import { splay } from "@derivate/core/lib/utils/hood";
import { logWith, log, access, extract, symbolMatches, typeEq, logIt } from "@derivate/core/lib/utils/compilerUtils";
import { syntaxKindtoName } from '@derivate/core/lib/utils/syntaxKind';

const JSDocTagName = "implied";
const FuncName = "__deriveIO";
// const ModuleName = "derivate/lib/io-ts-type";
// const ModuleName = "../src/io-ts-type";

const accessT = (id: ts.Identifier, s: string): D.Derivate<ts.PropertyAccessExpression> =>
  D.of(
    ts.createPropertyAccess(
      ts.createPropertyAccess(
        id,
        ts.createIdentifier(tImport))
      , ts.createIdentifier(s))
  );

const callT = (
  importId: ts.Identifier,
  s: string
): ((...args: ts.Expression[]) => D.Derivate<ts.CallExpression>) => (...args) =>
  pipe(
    accessT(importId, s),
    D.map(str => ts.createCall(str, undefined, args))
  );

const tImport = "t";

export const IoTsDeriver = (moduleName: string = "@derivate/io-ts-deriver/lib/io-ts-type"): Deriver<ts.Identifier> => ({
  expressionBuilder: (
    type: ts.Type,
    id: ts.Identifier,
    advance: (t: ts.Type, step: D.ContextStep) => D.Derivate<ts.Expression>,
    currentPath: D.PathContext,
  ) => {
    return matchType<D.Derivate<ts.Expression>>({
      stringLiteral: str => callT(id, "literal")(ts.createStringLiteral(str.value)),
      string: () => accessT(id, "string"),
      numberLiteral: num => callT(id, "literal")(ts.createLiteral(num.value)),
      number: () => accessT(id, "number"),
      void: () => accessT(id, "void"),
      unknown: () => accessT(id, "unknown"),
      any: () => accessT(id, "any"),
      booleanLiteral: bool => callT(id, "literal")(ts.createLiteral(bool.value)),
      boolean: () => accessT(id, "boolean"),
      union: u =>
        pipe(
          splay(u.types),
          hoods =>
            array.traverse(D.derivate)(hoods, hood =>
              advance(hood.focus, {
                _type: "union",
                hood
              })
            ),
          D.map(ts.createArrayLiteral),
          D.chain(callT(id, "union"))
        ),
      intersection: i =>
        pipe(
          splay(i.types),
          hoods =>
            array.traverse(D.derivate)(hoods, hood =>
              advance(hood.focus, {
                _type: "intersection",
                hood
              })
            ),
          D.map(ts.createArrayLiteral),
          D.chain(callT(id, "union"))
        ),
  
      class: t =>
        D.error(D.unsupportedType(
          t.type,
          "classes ain't supported",
          currentPath
        )),
      interface: t =>
        D.error(D.unsupportedType(
          t.type,
          "interfaces ain't supported",
          currentPath
        )),
      // todo: hmm
      // generic: { type: ts.Type, parameters: ts.Type[] },
      function: () => accessT(id, "Function"),
      struct: ({ extract }) =>
        D.askM(({ checker, source }) =>
          pipe(
            extract(checker, source),
            ({ props }) =>
              array.traverse(D.derivate)(
                props,
                propFold({
                  method: name =>
                    pipe(
                      accessT(id, "function"),
                      D.map(acc => ts.createPropertyAssignment(name, acc))
                    ),
                  property: (name, t) => {
                    return pipe(
                      advance(t, { _type: "prop", name, type: t }),
                      D.map(acc => ts.createPropertyAssignment(name, acc))
                    );
                  }
                })
              ),
            D.map(ts.createObjectLiteral),
            D.chain(callT(id, "type"))
          )
        ),
  
      default: () =>
        D.error({ _type: "Exception", message: 'sent to "default" matcher' })
    })(type);
  },
  symbolRepresentsTcForType: (symbol, type) =>
    Do(D.derivate)
      .bind("checker", D.ask(a => a.checker))
      .bind("rootNode", D.ask(a => a.deriveNode))
      .bindL("represents", ({ checker, rootNode }) => {
        const typ = pipe(
          O.tryCatch(() => checker.getTypeOfSymbolAtLocation(symbol, rootNode))
        );
        const matches = pipe(
          typ,
          O.chain(t => O.fromNullable(t.symbol)),
          O.chain(s => O.fromNullable(s.declarations)),
          O.chain(A.head),
          O.chain(O.fromNullable),
          O.map(access("parent")),
          O.chain(extract(ts.isSourceFile)),
          O.map(a => a.fileName.endsWith("io-ts/lib/index.d.ts")),
          O.map(
            matches =>
              matches &&
              pipe(
                // todo: should this be handle by derivate?
                symbol.getJsDocTags(),
                A.findFirst(tag => tag.name === JSDocTagName),
                O.isSome
              )
          ),
          O.getOrElse(() => false)
        );
        if (matches) {
          // get jsdoc annotations
          // console.log('MATCHED', symbol.name)
          return pipe(
            typ,
            O.chain(t =>
              O.tryCatch(
                () =>
                  checker.getTypeArguments(t as ts.TypeReference) as ts.Type[]
              )
            ),
            O.chain(A.head),
            O.map(t => typeEq(checker).equals(t, type)),
            O.getOrElse(() => false),
            D.of
          );
        } else {
          return D.of(false);
        }
      })
      .return(p => p.represents),

  extractor: node =>
    pipe(
      D.deriver,
      D.map(({ context: { checker } }) =>
        Do(O.option)
          .bind("ce", extract(ts.isCallExpression)(node))
          // .bindL("ceName", ({ce}) => extract(ts.isIdentifier)(ce.expression))
          .bindL("propAccess", ({ce}) => {
            return extract(ts.isPropertyAccessExpression)(ce.expression)
          })
          .bindL("leftExpression", ({propAccess}) => extract(ts.isIdentifier)(propAccess.expression))
          .bindL(
            "identifier", ({propAccess, leftExpression}) => {
              return pipe(
                O.fromNullable(checker.getSymbolAtLocation(leftExpression)),
                O.map(symbolMatches(FuncName, moduleName)),
                O.chain(matches => (matches && propAccess.name.text === 'derive' ? O.some(leftExpression) : O.none))
              )
            }
          )
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
          .return(({ ce, identifier, type }) => {
            
            // console.log("found!");
            // console.log("  call expression:", ce.getText());
            
            // console.log('  children:');
            // ce.getChildren().forEach(n => {
            //   console.log('      :', syntaxKindtoName(n.kind), `(${n.getText()})`)
            // })
            // console.log("  extracted type :", type.symbol.escapedName);
            return [type, identifier];
          })
      )
    )
});
