import { __derive as yo } from '../src/io-ts-type';
import { User } from './User';
import { Type } from 'io-ts';

type Aardvark = { hmm: Date };

{
  /**
   * @implied
   */
  const userC: Type<User> = null as any;

  type Wut = {
    a: string,
    b: number,
    c: Aardvark | User | number | string
  }

  yo<Wut>()
}
