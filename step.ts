import * as ts from 'typescript';
import { Reader } from 'fp-ts/lib/Reader';
import { ReaderT, getReaderM } from 'fp-ts/lib/ReaderT';
import { state } from 'fp-ts/lib/State'
import { StateT } from 'fp-ts/lib/StateT';
import { StateReaderTaskEither, right, left } from 'fp-ts/lib/StateReaderTaskEither';
import { of } from 'fp-ts/lib/Task';


type DerivativeState = {}
type DerivativeError = {}
type DerivativeContext = {
  checker: ts.TypeChecker,
  program: ts.Program
}

type DerivativeTransformer<A> = StateReaderTaskEither<DerivativeState, DerivativeContext, DerivativeError, A> 

const foo: DerivativeTransformer<number> = right(5)



