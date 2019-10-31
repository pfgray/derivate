export declare type Hood<A> = {
    left: A[];
    focus: A;
    right: A[];
};
export declare const splay: <A>(as: A[]) => Hood<A>[];
export declare const map: <A, B>(f: (a: A) => B) => (a: Hood<A>) => Hood<B>;
