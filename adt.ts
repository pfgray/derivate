export type ADT<T extends Record<string, {}>> = {[K in keyof T]: {_type: K} & T[K] }[keyof T]
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>
export type ADTMember<ADT, Type extends string> = Omit<Extract<ADT, { _type: Type }>, "_type">

export function match<ADT extends { _type: string }>(
  v: ADT
): <Z>(
  matchObj: {
    [K in ADT["_type"]]: (v: ADTMember<ADT, K>) => Z
  }
) => Z {
  return matchObj => (matchObj as any)[v._type](v)
};
