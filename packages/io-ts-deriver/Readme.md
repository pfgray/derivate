# io-ts-deriver

io-ts-deriver is a typescript transformer which makes it simple to generate [io-ts](https://github.com/gcanti/io-ts) codecs from types.

```bash
yarn add @derivate/io-ts-deriver
```

There are two steps to use this generator:
1. [Configure the transformer](#enable)
2. [Use the provided method in your code](#usage)

## Enable:

### Using webpack/ts-loader:
```js
const { ioTsTransformer } = require("@derivate/io-ts-deriver/lib/io-ts-transformer");

{
  loader: "ts-loader",
  options: {
    getCustomTransformers: (program) => {
      return {
        before: [ioTsTransformer(program)]
      };
    }
  }
}
```

### Using the Typescript API:
```js
import { ioTsTransformer } from '@derivate/io-ts-deriver/lib/io-ts-transformer';
const program = ts.createProgram(...);

const emitResult = program.emit(
  undefined,
  undefined,
  undefined,
  undefined,
  {
    before: [
      ioTsTransformer(program)
    ]
  }
)
```

## Usage:

```ts
import { __deriveIO } from '@derivate/io-ts-deriver/lib/io-ts-type'

const io = __deriveIO.derive<{name: string, age: number}>()

io.decode({name: 'Bob', age: 56})
```

Here, the expression: `__deriveIO.derive<{name: string, age: number}>()` will be replaced with a codec for the `{name: string, age: number}` type.

### Using custom codecs:
Sometimes you'd like to use custom codecs for classes and certain types. All you need is to mark an instance of that codec with an JSDoc annotation `@implied`:

```ts
import * as t from 'io-ts'

/**
 * @implied
 */
const dateCodec: t.Type<Date, string, unknown> = // ... build codec that serialized to ISO

const io = __deriveIO.derive<{name: string, age: number, lastLogin: Date}>()

io.decode({name: 'Bob', age: 56, lastLogin: '2019-12-20T0:00:00Z'})
```

In this case, the `dateCodec` value will be used in the resulting type definition, for instance:
```ts
__deriveIO.derive<{name: string, age: number, lastLogin: Date}>()
```
will be transformed into: 
```ts
t.type({ name: t.string, age: t.number, lastLogin: dateCodec })
```