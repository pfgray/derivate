import { __deriveIO } from '@derivate/io-ts-deriver/lib/io-ts-type'
import * as t from 'io-ts'

function foo<A>(f: t.Type<A, unknown, unknown>): t.Type<Foo<A>, Foo<A>, unknown> {
  return null as any;
}

type Foo<A> = {
  value: A
}

const bar = __deriveIO.derive<Foo<any>>()
