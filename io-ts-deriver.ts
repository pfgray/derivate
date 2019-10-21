import { Do } from "fp-ts-contrib/lib/Do";
import {
  Extractor,
  access,
  extract,
  extractModuleNameFromNamedImports,
  extractNameFromNamedImports,
} from "./transform2";
import * as ts from "typescript";
import * as D from "./derivate";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { flow } from "fp-ts/lib/function";
import { Deriver } from "./deriver";

const FuncName = "__derive";
const ModuleName = "./derive";

export const IoTsDeriver: Deriver = {
  expressionBuilder: (type, advance) =>
    D.of(
      ts.createPropertyAccess(
        ts.createIdentifier("t"),
        ts.createIdentifier("foo")
      )
    ),
  symbolRepresentsTcForType: (symbol, type) => {
    console.log("%%%% looking at:", symbol.getName());
    console.log("%%%% does it represent: ", type.symbol.getName(), "?");
    return D.of(false);
  },
  extractor: node =>
  pipe(
    D.deriver,
    D.map(({ context: { checker } }) =>
      Do(O.option)
        .bind("ce", extract(ts.isCallExpression)(node))
        .bindL(
          "ni",
          flow(
            access("ce"),
            access("expression"),
            extract(ts.isIdentifier),
            O.chain(n => O.fromNullable(checker.getSymbolAtLocation(n))),
            O.chain(s => O.fromNullable(s.declarations[0])),
            O.map(d => d.parent),
            O.chain(extract(ts.isNamedImports))
          )
        )
        .bindL(
          "functionName",
          flow(
            access("ni"),
            extractNameFromNamedImports,
            O.chain(isStr(FuncName))
          )
        )
        .bindL(
          "moduleName",
          flow(
            access("ni"),
            extractModuleNameFromNamedImports,
            O.chain(isStr(ModuleName))
          )
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
        .return(({ ce, ni, type, functionName, moduleName }) => {
          console.log("found!");
          console.log("  call expression:", ce.getText());
          console.log("  function name  :", functionName);
          console.log("  module name    :", moduleName);

          console.log("  extracted type :", type.symbol.escapedName);
          return type;
        })
    )
  )
}

const isStr = <K extends string>(k: K): ((s: string) => O.Option<K>) => s =>
  s === k ? O.some(s as K) : O.none;
