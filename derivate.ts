import * as E from 'fp-ts/lib/Either';
import { Monad1 } from 'fp-ts/lib/Monad';
import * as NEA from 'fp-ts/lib/NonEmptyArray';
import { pipeable } from 'fp-ts/lib/pipeable';
import * as R from 'fp-ts/lib/Reader';
import * as S from 'fp-ts/lib/State';
import * as ts from 'typescript';

import State = S.State;

import Reader = R.Reader;

type DerivateState = { }
type DerivateError = Exception // todo: add more errors

type Exception = { _type: 'exception', message: string }
type Context = {
  checker: ts.TypeChecker,
  program: ts.Program,
  source: ts.SourceFile
}

type CanError<A> = E.Either<NEA.NonEmptyArray<DerivateError>, A>
type Derivate<A> = Reader<Context, State<DerivateState, CanError<A>>>

const URI = 'DerivativeTransformer'
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

const of = <A>(a: A): Derivate<A> => R.of(S.of(E.right(a)))

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

export const error = (err: DerivateError): Derivate<never> => R.of(S.of(E.left([err])))

export const derivativeTransformer: Monad1<'DerivativeTransformer'> = {
  URI,
  ap: apD,
  of,
  map: mapD,
  chain: chainD
}

export const { ap, apFirst, apSecond, chain, chainFirst, flatten, map } = pipeable(derivativeTransformer)