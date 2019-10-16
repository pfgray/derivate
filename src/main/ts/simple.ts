import { __derive as yo } from './derive';
import { User } from './User';
import { Type } from 'io-ts';

function wut() {
  console.log('lmao')
}

{
  const userC: Type<User> = null as any;

  wut()
  yo<User>()
}
