import {__derive} from './derive';
import { User } from './User';
import { Type } from 'io-ts';

{
  const userC: Type<User> = null as any;
  __derive<User>()
}

{
  const dateC: Type<Date> = null as any;
  __derive<User>()
}

{
  const lmao: Type<User> = null as any;
  (function() {
    __derive<{foo: number}>()
  })()
}


// if(true) {
//   (function() {
//     __derive<{foo: number}>()
//   })()
// }

// __derive<{foo: number} & { name: string}>()
// __derive<{foo: number} | { name: string}>()
// __derive<{name: 'a'} | { name: 'b'}>()
// __derive<string>()

