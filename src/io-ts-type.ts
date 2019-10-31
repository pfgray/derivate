import { Type } from 'io-ts';

export function __derive<T>(): Type<T> {
  throw new Error("Cant derive type instance, this function must be transformed by the transformer")
}