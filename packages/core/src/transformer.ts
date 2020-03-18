import { Do } from "fp-ts-contrib/lib/Do";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import { flow } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { Lens } from "monocle-ts";
import * as ts from "typescript";
import * as D from "./derivate";
import { Deriver } from "./deriver";
import { access, isTypeAssignableTo, typeEq, isGeneric, symbolMatches } from "./utils/compilerUtils";
import { dim, red } from "./utils/console";
import { printType } from "./utils/helpers";
import { Hood } from "./utils/hood";
import { typeFlagToName, symbolFlagToName } from "./utils/syntaxKind";
import { hasModifier, isSymbolFlagSet, isGenericType } from "tsutils";

// declare const foo: ts.Type

const toArray = <T>(o: O.Option<T>): T[] => (O.isSome(o) ? [o.value] : []);

export type Extractor = (node: ts.Node) => D.Derivate<O.Option<ts.Type>>;

/**
 * Get the _real_ (or, 'original') name of the first named import
 * in this NamedImports.
 */
export const extractNameFromNamedImports = (
  ni: ts.NamedImports
): O.Option<string> =>
  pipe(
    O.fromNullable(ni.elements[0]),
    O.map(el =>
      pipe(
        O.fromNullable(el.propertyName),
        O.map(prop => prop.text),
        O.getOrElse(() => el.name.text)
      )
    )
  );

// is t generic?
// if so, search for a function which has a parameter 

// t is: Option<T>
// function optionCodec<T>(t: Codec<T>): Codec<Option<T>>

// t is Either<L, R>
// function eitherCodec<L, R>(l: Codec<L>, r: Codec<R>): Codec<Either<L, R>>

const searchScope = <T>(
  rootLocation: ts.Node,
  deriver: Deriver<T>
): ((t: ts.Type) => D.Derivate<O.Option<ts.Expression>>) => t =>
    D.askM(({ checker, source }) =>
      pipe(
        checker.getSymbolsInScope(rootLocation, ts.SymbolFlags.Value),
        // todo: this next step could probably short circuit, instead of searching all...
        symbols => {

          return pipe(
            isGeneric(t),
            O.fold(
              () => {
                return A.array.traverse(D.derivate)(symbols, symbol =>
                  pipe(
                    deriver.symbolRepresentsTcForType
                      ? deriver.symbolRepresentsTcForType(symbol, t)
                      : D.of(false),
                    D.map(isGood => (isGood ? O.some(symbol) : O.none))
                  )
                )
              }
            , genericParameters => {
              // if
              symbols.map(s => {

                
                if(s.name === "foo" && isSymbolFlagSet(s, ts.SymbolFlags.Function)) {
                  

                  deriver.symbolRepresentsTcBuilderForType ? deriver.symbolRepresentsTcBuilderForType(s, genericParameters, t) : false

                  
                  //  if the return type is Type (from io-ts)
                  //    and there are the same amount of generic params to the function as there are in genericParameters,


                  // advance on genericParameters
                  


                  // build an expression which calls this function, and supplies the genericParameters
                  console.log("In our search for a codec for: " , printType(checker, source)(t))
                  

                  console.log('rootLocation is:', rootLocation.pos)
                  const typ = checker.getTypeOfSymbolAtLocation(s, rootLocation)

                  console.log("Call signatures: ")
                  typ.getCallSignatures().forEach(cs => {
                    console.log("  return ", cs.getReturnType().getSymbol()?.name)

                    // if the symbol 
                    

                    // cs.getReturnType().symbol.
                    cs.getReturnType().symbol.declarations
                    if(symbolMatches("Type", "io-ts")(cs.getReturnType().symbol)) {
                      console.log('The function', s.name, "returns a Type from io-ts")
                    } else {
                      console.log('The function', s.name, " does NOT return a Type from io-ts")
                    }

                    pipe(
                      isGeneric(cs.getReturnType()),
                      O.map(a => {
                        // if the first type parameter of this type

                        // console.log("  type param: ", a.map(t => t.symbol.name))
                      })
                    )
                    console.log("  and ", )
                  })

                  // typ.getCallSignatures()
                  // const dec = s.declarations[0]

                  // if(ts.isFunctionDeclaration(dec)){
                  //   dec.typeParameters()
                  // }
                  
                  console.log("Found function symbol: ", s.name);
                  // console.log("  flags: ", symbolFlagToName(s.flags))
                }
              })
              return D.error(D.exception("We don't support generic types atm"))
            })
          )

          //  if it is generic... find a function which has only X generic parameters,
          //    and returns t, except with the parameterized params. todo: does order matter?

          // find symbols which are functions that
          
          
        },
        D.map(
          flow(
            A.chain(a => toArray(a)),
            A.head,
            O.map(symbol => ts.createIdentifier(symbol.getName()))
          )
        )
      )
    );

const findType = (
  t: ts.Type
): (<I extends { type: ts.Type }, T extends I[]>(
  types: T
) => D.Derivate<O.Option<I>>) => types =>
    D.ask(({ checker }) =>
      pipe(
        types,
        A.findFirst(
          ({ type }) =>
            isTypeAssignableTo(checker, type, t) &&
            isTypeAssignableTo(checker, type, t)
        )
      )
    );

const findInResolved = (t: ts.Type): D.Derivate<O.Option<ts.Expression>> =>
  pipe(
    D.get,
    D.map(
      flow(
        access("queries"),
        access("resolved")
      )
    ),
    D.chain(findType(t)),
    D.map(
      O.map(
        found =>
          (found as { type: ts.Type; expression: ts.Expression }).expression
      )
    )
  );

// const hasBeenQueried = (t: ts.Type): D.Derivate<boolean> =>
//   pipe(
//     D.get,
//     D.map(
//       flow(
//         access("queries"),
//         access("queried")
//       )
//     ),
//     D.chain(findType(t)),
//     D.map(O.isSome)
//   );

const queriedL = Lens.fromPath<D.DerivateState>()(["queries", "queried"]);
const resolvedL = Lens.fromPath<D.DerivateState>()(["queries", "resolved"]);

const addResolvedExpression = (
  e: ts.Expression,
  t: ts.Type
): ((d: D.DerivateState) => D.DerivateState) =>
  resolvedL.modify(resolutions => [...resolutions, { expression: e, type: t }]);

/**
 * is it in resolved?
 *   is it already queried? then return an error
 *   add to queried
 * @param t
 */
const query = <T>(
  rootLocation: ts.Node,
  deriver: Deriver<T>
): ((t: ts.Type) => D.Derivate<O.Option<ts.Expression>>) => t =>
    Do(D.derivate)
      .sequenceS({
        resolved: findInResolved(t)
        // queried: hasBeenQueried(t) todo: not sure I need this
      })
      .do(D.modify(queriedL.modify(q => [...q, { type: t }])))
      .bindL("ret", ({ resolved }) => D.of(resolved))
      .bind("search", searchScope(rootLocation, deriver)(t))
      .doL(
        flow(
          access("search"),
          O.fold(
            // null is fine here, return is thrown out
            () => D.of(null as unknown),
            e => D.modify(addResolvedExpression(e, t))
          )
        )
      )
      .return(c => {
        return pipe(
          c.search,
          O.alt(() => c.ret)
        )
      });

let importedFiles: string[] = []

export function makeTransformer<T>(
  deriver: Deriver<T>
): <N extends ts.Node>(program: ts.Program) => ts.TransformerFactory<N> {
  // dunno a way to avoid this mutated state...
  // let importedFiles: string[] = []
  let ids: string[]
  return program => {
    return context => {
      const checker = program.getTypeChecker();
      const visit: ts.Visitor = node => {
        const source = node.getSourceFile();
        const buildExpressionInner = (
          t: ts.Type,
          context: T,
          queried: ts.Type[],
          path: D.PathContext
        ): D.Derivate<ts.Expression> =>
          pipe(
            queried,
            A.findFirst(q => typeEq(checker).equals(q, t)),
            O.fold(
              () =>
                Do(D.derivate)
                  .bind("query", query(node, deriver)(t))
                  .bindL("expression", ({ query }) =>
                    pipe(
                      query,
                      O.map(h => D.of(h)),
                      O.getOrElse(() =>
                        deriver.expressionBuilder(t, context, (nextType, step) =>
                          buildExpressionInner(
                            nextType,
                            context,
                            [...queried, t],
                            [...path, step]
                          )
                          , path)
                      )
                    )
                  )
                  .return(access("expression")),
              t => D.error(D.recursive(t, path))
            )
          );

        const programD = Do(D.derivate)
          .bind("type", deriver.extractor(node))
          .bindL("expression", ({ type }) => {
            // console.log('Now building expression!', type)
            return pipe(
              type,
              O.map(t => buildExpressionInner(t[0], t[1], [], [])),
              O.option.sequence(D.derivate)
            )
          })
          .return(access("expression"));

        const [result] = programD({
          checker,
          program,
          source: node.getSourceFile(),
          deriveNode: node
        })({ queries: { queried: [], resolved: [] } });

        if (E.isLeft(result)) {
          let errMessage: string = "";
          result.left.forEach(err => {
            const pr = (t: ts.Type) => printType(checker, source)(t);
            if (err._type === "RecursiveTypeDetected") {
              errMessage += "Recursive type detected:\n";
              errMessage += printPath(pr, err.path)
            } else if (err._type === "UnsupportedType") {
              errMessage +=
                "Unsupported type: " + pr(err.type) + ` (${err.label})\n`;
              errMessage += printPath(pr, err.path)
            } else if (err._type === "Exception") {
              errMessage += err.message
            }
          });
          // console.log(errMessage)
          throw new Error(errMessage);
        } else if (O.isSome(result.right)) {
          return result.right.value;
        } else {
          return ts.visitEachChild(node, child => visit(child), context);
        }
      };

      return node => ts.visitNode(node, visit);
    };
  };
}

const printPath = (pr: (t: ts.Type) => string, path?: D.PathContext, ): string => {
  return path ? path
    .map((path, i) => {
      if (path._type === "prop") {
        return indentTo(
          i + 1,
          `└─ ${red(path.name)}: ${dim(pr(path.type))}`
        );
      } else if (path._type === "intersection") {
        return indentTo(
          i + 1,
          `└─ ${printHood("|", pr)(path.hood)}`
        );
      } else if (path._type === "union") {
        return indentTo(
          i + 1,
          `└─ ${printHood("|", pr)(path.hood)}`
        );
      }
    }).join('\n') : '';
}

export const printHood = (
  separator: string,
  print: (t: ts.Type) => string
): ((h: Hood<ts.Type>) => string) => h =>
    (h.left.length > 0
      ? dim(h.left.map(print).join(` ${separator} `) + ` ${separator} `)
      : "") +
    red(print(h.focus)) +
    (h.right.length > 0
      ? dim(` ${separator} ` + h.right.map(print).join(` ${separator} `))
      : "");

export const indentTo = (n: number, s: string): string => {
  let str = "";
  for (var i = 0; i < n; i++) {
    str = str + " ";
  }
  return str + s;
};
