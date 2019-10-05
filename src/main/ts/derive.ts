import * as io from 'io-ts';

export function __derive<T>(): io.Type<T> {
  throw new Error("Cant derive type instance, this function must be transformed by the transformer")
}