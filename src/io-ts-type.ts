import * as t from 'io-ts';

export const __deriveIO = {
  derive: function<T>(): t.Type<T> {
    throw new Error("Cant derive type instance, this function must be transformed by the transformer")
  },
  t,
}