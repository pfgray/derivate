import { extract, access, symbolMatches } from './utils';
import { Do } from "fp-ts-contrib/lib/Do";
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
  symbolRepresentsTcForType: (symbol, type) =>
    Do(D.derivate)
      .bind('checker', D.ask(a => a.checker))
      .bind('rootNode', D.ask(a => a.deriveNode))
      .bindL('represents', ({checker, rootNode}) => {
        const typ = checker.getTypeOfSymbolAtLocation(symbol, rootNode)
        // does type represent this thing?
        if(symbol.getName() === 'userC') {
          // typ.symbol.declarations

          console.log("%%%% looking at:", symbol.getName());
          console.log("%%%% does ", typ.symbol.getName()," represent: ", type.symbol.getName(), "?");
        }
        return D.of(false)
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
