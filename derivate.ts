import { Do } from 'fp-ts-contrib/lib/Do';
import * as E from 'fp-ts/lib/Either';
import { Monad1 } from 'fp-ts/lib/Monad';
import * as NEA from 'fp-ts/lib/NonEmptyArray';
import { pipeable, pipe } from 'fp-ts/lib/pipeable';
import * as R from 'fp-ts/lib/Reader';
import * as S from 'fp-ts/lib/State';
import * as ts from 'typescript';

import State = S.State;
import Reader = R.Reader;
import { Option, isNone } from 'fp-ts/lib/Option';
import { ADT, match } from './adt';
import { red } from './console';
import { identity } from 'fp-ts/lib/function';

export type TypeQueryResult = ADT<{
  queried: { type: ts.Type },
  resolved: { type: ts.Type, expression: ts.Expression }
}>

export type TypeQueryContext = {
  queried: { type: ts.Type }[],
  resolved: { type: ts.Type, expression: ts.Expression }[]
}

export type ExpressionResolver = (t: ts.Type, recurse: (t: ts.Type) => Derivate<ts.Expression>) => Derivate<ts.Expression>

export type DerivateState = {
  queries: TypeQueryContext
}

export type ContextStep = ADT<{
  prop: { name: string },
  intersection: { before: ts.Type, after: ts.Type },
  union: { before: ts.Type, after: ts.Type },
}>

export type PathContext = ContextStep[];

export type DerivateError = ADT<{
  Exception: { message: string },
  UnsupportedType: { type: ts.Type, label: string },
  InvalidProp: { name: string, pos: {line: number, char: number} },
  UnableToFind: { type: ts.Type, path: PathContext },
  RecursiveTypeDetected: { type: ts.Type }
}>

export const printError = (e: DerivateError): string => 
  match(e)({
    Exception: e => `Whoops, ${e.message}`,
    UnsupportedType: e => `The type ${red(e.label)} isn't supported for derivation.`,
    InvalidProp: e => `The property ${red(e.name)} found didn't work out.`,
    UnableToFind: e => 'hmm!',
    RecursiveTypeDetected: e => 'recursive type! zomg'
  })

export const recursive = (type: ts.Type): DerivateError => ({_type: 'RecursiveTypeDetected', type})
export const exception = (message: string): DerivateError => ({ _type: 'Exception', message })
export const unsupportedType = (type: ts.Type, label: string): DerivateError => ({ _type: 'UnsupportedType', type, label})

export type Context = {
  checker: ts.TypeChecker,
  program: ts.Program,
  source: ts.SourceFile,
  deriveNode: ts.Node,
}

export type CanError<A> = E.Either<NEA.NonEmptyArray<DerivateError>, A>
export type Derivate<A> = Reader<Context, State<DerivateState, CanError<A>>>

export const URI = 'DerivativeTransformer'
declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    DerivativeTransformer: Derivate<A>;
  }
}

const neArraySemi = NEA.getSemigroup<DerivateError>()
const eitherValidation = E.getValidation(neArraySemi)

const apD = <A, B>(rseab: Derivate<(a: A) => B>, rsea: Derivate<A>): Derivate<B> =>
  context => {
    const seab = rseab(context)
    const sea = rsea(context)

    return state => {
      const [eab, state2] = seab(state)
      const [ea, state3] = sea(state2)
      return [eitherValidation.ap(eab, ea), state3]
    }
  }

export const of = <A>(a: A): Derivate<A> => R.of(S.of(E.right(a)))

const mapD = <A, B>(rsea: Derivate<A>, f: (a: A) => B): Derivate<B> =>
  context => {
    const sea = rsea(context)
    return state => {
      const [ea, state2] = sea(state)
      return [eitherValidation.map(ea, f), state2]
    }
  }  

const chainD = <A, B>(rsea: Derivate<A>, f: (a: A) => Derivate<B>): Derivate<B> =>
  context => {
    const sea = rsea(context)

    return (state: DerivateState): [CanError<B>, DerivateState] => {
      const [ea, state2] = sea(state);
      if(E.isRight(ea)) {
        const rsefa = f(ea.right)
        const sefa = rsefa(context)
        const [efa, state3] = sefa(state2);
        return [efa, state3];
      } else {
        return [ea, state2]
      }
    }
  }

export const derivate: Monad1<'DerivativeTransformer'> = {
  URI,
  ap: apD,
  of,
  map: mapD,
  chain: chainD
}

export const { ap, apFirst, apSecond, chain, chainFirst, flatten, map } = pipeable(derivate)

export const error = (err: DerivateError): Derivate<never> => R.of(S.of(E.left([err])))

export const get: Derivate<DerivateState> =
  R.of(state => [E.right(state), state])

export const put = (s: DerivateState): Derivate<DerivateState> =>
  R.of(() => [E.right(s), s])

export const modify = (f: (s: DerivateState) => DerivateState): Derivate<DerivateState> =>
  R.of(state => pipe(f(state), newState => [E.right(newState), newState]))

// export const putType = (type: IoType, expression: ts.Expression): Derivate<DerivateState> =>
//   pipe(
//     deriver,
//     chain(({context: { checker }}) =>
      
//     )
//   )

export const ask = <A>(f: (c: Context) => A): Derivate<A> => 
  pipe(
    R.ask<Context>(),
    R.map(c => S.of(E.right(f(c))))
  )

export const askM = <A>(f: (c: Context) => Derivate<A>): Derivate<A> => 
  pipe(
    R.ask<Context>(),
    R.chain(c => f(c))
  )

// type OptionHandler = <A>(o: Option<A>) => Derivate<A>
export const convert = (ifNone: DerivateError): (<A>(o: Option<A>) => Derivate<A>) =>
  op => isNone(op) ? error(ifNone) : of(op.value)

export const deriver =
  Do(derivate)
    .sequenceS({
      context: ask(identity),
      state: get
    }).done()


