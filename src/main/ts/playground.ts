import * as t from 'io-ts'
import { User } from './User';


// if there are extra properties on the target (type inside TypeC), then it's fine

{
  const d: t.Type<User> = t.intersection([
    t.type({name: t.string}),
    t.partial({age: t.number})
  ])

  t.boolean
}

const a = t.type({
  name: t.string,
  age: t.number
})

const b = t.type({
  name: t.string
})

const c = t.type({
  age: t.number
});

[
  a.decode({name: 'Paul', age: 4, gender: 'male'}),
  a.decode({name: 'Paul', age: 4}),
  a.decode({name: 'Paul'}),
].map(h => console.log(h))

