import { __derive as yo } from '../src/io-ts-type';
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

  const userCodec = yo<User>()
}
