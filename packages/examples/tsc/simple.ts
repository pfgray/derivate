import { __deriveIO } from '@derivate/io-ts-deriver/lib/io-ts-type';
import { Type } from 'io-ts';

type Aardvark = { hmm: Date };

{
  /**
   * @implied
   */
  const dateC: Type<Date> = null as any;

  type User = {
    username: string,
    lastLoginTime: Date,
    b: number,
    c: Aardvark | number | string
  }

  const userCodec = __deriveIO.derive<User>()
}
