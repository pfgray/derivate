import { __deriveIO } from '@derivate/io-ts-deriver/lib/io-ts-type'

const io = __deriveIO.derive<{hmm: string, num: number}>()

console.log(io.decode({}))
console.log(io.decode({hmm: 'adf', num: 4}))
