export type Hood<A> = {
  left: A[],
  focus: A,
  right: A[]
}

const before = (i: number): (<A>(as: A[]) => A[]) => as => as.slice(0, i)
const after = (i: number): (<A>(as: A[]) => A[]) => as => as.slice(i + 1, as.length)

export const splay = <A>(as: A[]): Hood<A>[] =>
  as.map((a, i, as) => ({focus: a, left: before(i)(as), right: after(i)(as) }))

export const map = <A, B>(f: (a:A) => B): ((a: Hood<A>) => Hood<B>) =>
  ha => ({left: ha.left.map(f), focus: f(ha.focus), right: ha.right.map(f) })
