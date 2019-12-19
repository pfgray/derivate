import { Hood } from './utils/hood';
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
import { ADT, match, matchI } from 'ts-adt';
import { red, dim } from './utils/console';
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
  prop: { name: string, type: ts.Type },
  intersection: { hood: Hood<ts.Type> },
  union: { hood: Hood<ts.Type> },
}>

export type PathContext = ContextStep[];

export type DerivateError = ADT<{
  Exception: { message: string, path?: PathContext },
  UnsupportedType: { type: ts.Type, label: string, path?: PathContext },
  InvalidProp: { name: string, pos: {line: number, char: number}, path?: PathContext },
  UnableToFind: { type: ts.Type, path?: PathContext },
  RecursiveTypeDetected: { type: ts.Type, path?: PathContext }
}>

export const printError = (e: DerivateError): string => 
  matchI(e)({
    Exception: e => `Whoops, ${e.message}`,
    UnsupportedType: e => `The type ${red(e.label)} isn't supported for derivation.`,
    InvalidProp: e => `The property ${red(e.name)} found didn't work out.`,
    UnableToFind: e => 'hmm!',
    RecursiveTypeDetected: e => 'recursive type!\n' + printPathContext(e.path)
  })

export const printPathContext = (p?: PathContext): string => {
  // const inner = (indent: number): string =>
  
  return p? p.map(match({
    prop: a => `${red(a.name)}`,
    intersection: i => `${i.hood.left.map(b => dim(b.symbol.getName())).join(' & ')} & ${i.hood.focus.symbol.getName()} & ${i.hood.right.map(b => dim(b.symbol.getName())).join(' & ')}`,
    union: i => `${i.hood.left.map(b => dim(b.symbol.getName())).join(' | ')} | ${i.hood.focus.symbol.getName()} | ${i.hood.right.map(b => dim(b.symbol.getName())).join(' | ')}`,
  })).join('\n') : ''
}

export const recursive = (type: ts.Type, path: PathContext): DerivateError => ({_type: 'RecursiveTypeDetected', type, path})
export const exception = (message: string): DerivateError => ({ _type: 'Exception', message })
export const unsupportedType = (type: ts.Type, label: string, path?: PathContext): DerivateError => ({ _type: 'UnsupportedType', type, label, path})

export type Context = {
  checker: ts.TypeChecker,
  program: ts.Program,
  source: ts.SourceFile,
  deriveNode: ts.Node,
}

export type CanError<A> = E.Either<NEA.NonEmptyArray<DerivateError>, A>

/**
 * The effect context of a single derivation.
 * 
 * Essentially, this type represents a value of type:
 * ```ts
 * (c: Context) => (state: DerivateState) => [Either<NeArray<DerivateError>>, A>, DerivateState]
 * ```
 * where `A` is the value that's generated as a result of applying the context & state.
 * 
 * The compuation can fail with a non empty list of Errors.
 */
export type Derivate<A> = Reader<Context, State<DerivateState, CanError<A>>>

export const URI = 'Derivate'
declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    Derivate: Derivate<A>;
  }
}

const neArraySemi = NEA.getSemigroup<DerivateError>()
const eitherValidation = E.getValidation(neArraySemi)

/**
 * Applicative ap for Derivate
 * @param rseab 
 * @param rsea 
 */
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

/**
 * Monad point for Derivate
 * @param a 
 */
export const of = <A>(a: A): Derivate<A> => R.of(S.of(E.right(a)))

/**
 * Functor map for Derivates
 * @param rsea 
 * @param f 
 */
const mapD = <A, B>(rsea: Derivate<A>, f: (a: A) => B): Derivate<B> =>
  context => {
    const sea = rsea(context)
    return state => {
      const [ea, state2] = sea(state)
      return [eitherValidation.map(ea, f), state2]
    }
  }  

/**
 * Monadic bind for Derivate
 * @param rsea 
 * @param f 
 */
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

/**
 * Monad instance for Derivate
 */
export const derivate: Monad1<'Derivate'> = {
  URI,
  ap: apD,
  of,
  map: mapD,
  chain: chainD
}

export const { ap, apFirst, apSecond, chain, chainFirst, flatten, map } = pipeable(derivate)

/**
 * Fail with the given error
 * @param err 
 */
export const error = (err: DerivateError): Derivate<never> => R.of(S.of(E.left([err])))

/**
 * Retrieve the current value of state
 */
export const get: Derivate<DerivateState> =
  R.of(state => [E.right(state), state])

/**
 * Replaces the current state value
 * @param s 
 */
export const put = (s: DerivateState): Derivate<DerivateState> =>
  R.of(() => [E.right(s), s])

/**
 * Modifies the current state value, using the given function
 * @param f 
 */
export const modify = (f: (s: DerivateState) => DerivateState): Derivate<DerivateState> =>
  R.of(state => pipe(f(state), newState => [E.right(newState), newState]))

/**
 * Retrieve the Context
 */
export const askC: Derivate<Context> =
  pipe(
    R.ask<Context>(),
    R.map(c => S.of(E.right(c)))
  )

/**
 * Retrieve some value from Context, using the provided selector function
 * @param f 
 */
export const ask = <A>(f: (c: Context) => A): Derivate<A> => 
  pipe(
    R.ask<Context>(),
    R.map(c => S.of(E.right(f(c))))
  )

/**
 * Retrieve some value from Context, chaining the returned value from
 * the provided selector function
 * @param f 
 */
export const askM = <A>(f: (c: Context) => Derivate<A>): Derivate<A> => 
  pipe(
    R.ask<Context>(),
    R.chain(c => f(c))
  )

/**
 * Converts an `Option<A>` value to a `Derivate<A>`, using the provided error
 * in the case that the option is `None`
 * @param ifNone 
 */
export const convert = (ifNone: DerivateError): (<A>(o: Option<A>) => Derivate<A>) =>
  op => isNone(op) ? error(ifNone) : of(op.value)

/**
 * Retrieve the Context and current State
 */
export const deriver: Derivate<{ context: Context, state: DerivateState }> =
  Do(derivate)
    .sequenceS({
      context: ask(identity),
      state: get
    }).done()


