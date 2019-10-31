export declare type ADT<T extends Record<string, {}>> = {
    [K in keyof T]: {
        _type: K;
    } & T[K];
}[keyof T];
declare type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
export declare type ADTMember<ADT, Type extends string> = Omit<Extract<ADT, {
    _type: Type;
}>, "_type">;
export declare function match<ADT extends {
    _type: string;
}>(v: ADT): <Z>(matchObj: {
    [K in ADT["_type"]]: (v: ADTMember<ADT, K>) => Z;
}) => Z;
export {};
