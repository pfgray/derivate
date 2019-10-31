import { Hood } from './utils/hood';
import * as E from 'fp-ts/lib/Either';
import { Monad1 } from 'fp-ts/lib/Monad';
import * as NEA from 'fp-ts/lib/NonEmptyArray';
import * as R from 'fp-ts/lib/Reader';
import * as S from 'fp-ts/lib/State';
import * as ts from 'typescript';
import State = S.State;
import Reader = R.Reader;
import { Option } from 'fp-ts/lib/Option';
import { ADT } from './utils/adt';
export declare type TypeQueryResult = ADT<{
    queried: {
        type: ts.Type;
    };
    resolved: {
        type: ts.Type;
        expression: ts.Expression;
    };
}>;
export declare type TypeQueryContext = {
    queried: {
        type: ts.Type;
    }[];
    resolved: {
        type: ts.Type;
        expression: ts.Expression;
    }[];
};
export declare type ExpressionResolver = (t: ts.Type, recurse: (t: ts.Type) => Derivate<ts.Expression>) => Derivate<ts.Expression>;
export declare type DerivateState = {
    queries: TypeQueryContext;
};
export declare type ContextStep = ADT<{
    prop: {
        name: string;
        type: ts.Type;
    };
    intersection: {
        hood: Hood<ts.Type>;
    };
    union: {
        hood: Hood<ts.Type>;
    };
}>;
export declare type PathContext = ContextStep[];
export declare type DerivateError = ADT<{
    Exception: {
        message: string;
    };
    UnsupportedType: {
        type: ts.Type;
        label: string;
    };
    InvalidProp: {
        name: string;
        pos: {
            line: number;
            char: number;
        };
        path: PathContext;
    };
    UnableToFind: {
        type: ts.Type;
        path: PathContext;
    };
    RecursiveTypeDetected: {
        type: ts.Type;
        path: PathContext;
    };
}>;
export declare const printError: (e: ({
    _type: "Exception";
} & {
    message: string;
}) | ({
    _type: "UnsupportedType";
} & {
    type: ts.Type;
    label: string;
}) | ({
    _type: "InvalidProp";
} & {
    name: string;
    pos: {
        line: number;
        char: number;
    };
    path: PathContext;
}) | ({
    _type: "UnableToFind";
} & {
    type: ts.Type;
    path: PathContext;
}) | ({
    _type: "RecursiveTypeDetected";
} & {
    type: ts.Type;
    path: PathContext;
})) => string;
export declare const printPathContext: (p: PathContext) => string;
export declare const recursive: (type: ts.Type, path: PathContext) => ({
    _type: "Exception";
} & {
    message: string;
}) | ({
    _type: "UnsupportedType";
} & {
    type: ts.Type;
    label: string;
}) | ({
    _type: "InvalidProp";
} & {
    name: string;
    pos: {
        line: number;
        char: number;
    };
    path: PathContext;
}) | ({
    _type: "UnableToFind";
} & {
    type: ts.Type;
    path: PathContext;
}) | ({
    _type: "RecursiveTypeDetected";
} & {
    type: ts.Type;
    path: PathContext;
});
export declare const exception: (message: string) => ({
    _type: "Exception";
} & {
    message: string;
}) | ({
    _type: "UnsupportedType";
} & {
    type: ts.Type;
    label: string;
}) | ({
    _type: "InvalidProp";
} & {
    name: string;
    pos: {
        line: number;
        char: number;
    };
    path: PathContext;
}) | ({
    _type: "UnableToFind";
} & {
    type: ts.Type;
    path: PathContext;
}) | ({
    _type: "RecursiveTypeDetected";
} & {
    type: ts.Type;
    path: PathContext;
});
export declare const unsupportedType: (type: ts.Type, label: string) => ({
    _type: "Exception";
} & {
    message: string;
}) | ({
    _type: "UnsupportedType";
} & {
    type: ts.Type;
    label: string;
}) | ({
    _type: "InvalidProp";
} & {
    name: string;
    pos: {
        line: number;
        char: number;
    };
    path: PathContext;
}) | ({
    _type: "UnableToFind";
} & {
    type: ts.Type;
    path: PathContext;
}) | ({
    _type: "RecursiveTypeDetected";
} & {
    type: ts.Type;
    path: PathContext;
});
export declare type Context = {
    checker: ts.TypeChecker;
    program: ts.Program;
    source: ts.SourceFile;
    deriveNode: ts.Node;
};
export declare type CanError<A> = E.Either<NEA.NonEmptyArray<DerivateError>, A>;
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
export declare type Derivate<A> = Reader<Context, State<DerivateState, CanError<A>>>;
export declare const URI = "Derivate";
declare module 'fp-ts/lib/HKT' {
    interface URItoKind<A> {
        Derivate: Derivate<A>;
    }
}
/**
 * Monad point for Derivate
 * @param a
 */
export declare const of: <A>(a: A) => Derivate<A>;
/**
 * Monad instance for Derivate
 */
export declare const derivate: Monad1<'Derivate'>;
export declare const ap: <A>(fa: Derivate<A>) => <B>(fab: Derivate<(a: A) => B>) => Derivate<B>, apFirst: <B>(fb: Derivate<B>) => <A>(fa: Derivate<A>) => Derivate<A>, apSecond: <B>(fb: Derivate<B>) => <A>(fa: Derivate<A>) => Derivate<B>, chain: <A, B>(f: (a: A) => Derivate<B>) => (ma: Derivate<A>) => Derivate<B>, chainFirst: <A, B>(f: (a: A) => Derivate<B>) => (ma: Derivate<A>) => Derivate<A>, flatten: <A>(mma: Derivate<Derivate<A>>) => Derivate<A>, map: <A, B>(f: (a: A) => B) => (fa: Derivate<A>) => Derivate<B>;
/**
 * Fail with the given error
 * @param err
 */
export declare const error: (err: ({
    _type: "Exception";
} & {
    message: string;
}) | ({
    _type: "UnsupportedType";
} & {
    type: ts.Type;
    label: string;
}) | ({
    _type: "InvalidProp";
} & {
    name: string;
    pos: {
        line: number;
        char: number;
    };
    path: PathContext;
}) | ({
    _type: "UnableToFind";
} & {
    type: ts.Type;
    path: PathContext;
}) | ({
    _type: "RecursiveTypeDetected";
} & {
    type: ts.Type;
    path: PathContext;
})) => Derivate<never>;
/**
 * Retrieve the current value of state
 */
export declare const get: Derivate<DerivateState>;
/**
 * Replaces the current state value
 * @param s
 */
export declare const put: (s: DerivateState) => Derivate<DerivateState>;
/**
 * Modifies the current state value, using the given function
 * @param f
 */
export declare const modify: (f: (s: DerivateState) => DerivateState) => Derivate<DerivateState>;
/**
 * Retrieve the Context
 */
export declare const askC: Derivate<Context>;
/**
 * Retrieve some value from Context, using the provided selector function
 * @param f
 */
export declare const ask: <A>(f: (c: Context) => A) => Derivate<A>;
/**
 * Retrieve some value from Context, chaining the returned value from
 * the provided selector function
 * @param f
 */
export declare const askM: <A>(f: (c: Context) => Derivate<A>) => Derivate<A>;
/**
 * Converts an `Option<A>` value to a `Derivate<A>`, using the provided error
 * in the case that the option is `None`
 * @param ifNone
 */
export declare const convert: (ifNone: ({
    _type: "Exception";
} & {
    message: string;
}) | ({
    _type: "UnsupportedType";
} & {
    type: ts.Type;
    label: string;
}) | ({
    _type: "InvalidProp";
} & {
    name: string;
    pos: {
        line: number;
        char: number;
    };
    path: PathContext;
}) | ({
    _type: "UnableToFind";
} & {
    type: ts.Type;
    path: PathContext;
}) | ({
    _type: "RecursiveTypeDetected";
} & {
    type: ts.Type;
    path: PathContext;
})) => <A>(o: Option<A>) => Derivate<A>;
/**
 * Retrieve the Context and current State
 */
export declare const deriver: Derivate<{
    context: Context;
    state: DerivateState;
}>;
