type Hood<A> = {
  left: A[],
  focus: A,
  right: A[]
}

const before = (i: number): (<A>(as: A[]) => A[]) => as => as.slice(0, i)
const after = (i: number): (<A>(as: A[]) => A[]) => as => as.slice(i + 1, as.length)

export const splay = <A>(as: A[]): Hood<A>[] =>
  as.map((a, i, as) => ({focus: a, left: before(i)(as), right: after(i)(as) }))

// console.log(splay([1, 2, 3]))