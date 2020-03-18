import { __deriveIO } from '@derivate/io-ts-deriver/lib/io-ts-type'
import { Option } from 'fp-ts/lib/Option'
import { Type } from 'io-ts'

function foo<A>(f: Type<A, unknown, unknown>): Type<Foo<A>, unknown, unknown> {
  return null as any;
}

type Foo<A> = {
  value: A
}

__deriveIO.derive<Foo<any>>()
