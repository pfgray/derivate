import { __deriveIO } from '@derivate/io-ts-deriver/lib/io-ts-type'

const io = __deriveIO.derive<{hmm: string, num: number}>()

console.log(io.decode({}))
console.log(io.decode({hmm: 'adf', num: 4}))

type Op<A> = {_tag: "some", value: A} | {_tag: "none"}


// __deriveIO.t.union([
//   __deriveIO.t.type({
//     _tag: __deriveIO.t.literal("none")
//   }),
//   __deriveIO.t.type({
//     _tag: __deriveIO.t.literal("some"),
//     value: __deriveIO.t.type({})
//   })
// ]);

const hmm =__deriveIO.derive<Op<number>>()

console.log(hmm.decode({}))
console.log(hmm.decode({_tag: 'some', value: 5}))
