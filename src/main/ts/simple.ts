import { __derive as yo } from './derive';
import { User } from './User';
import { Type } from 'io-ts';

{
  /**
   * @implied
   */
  // const userC: Type<User> = null as any;


  yo<{name: string, age: number, user: User}>()
}
