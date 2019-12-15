import * as t from 'io-ts';

export function __derive<T>(): t.Type<T> {
  throw new Error("Cant derive type instance, this function must be transformed by the transformer")
}

__derive.t = t