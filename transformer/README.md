# TypeScript Transformer for Runtime Types & Reflection (tst-reflect-transformer)

> This package is compile/transpile time part of `tst-reflect`.

[![tst-reflect](https://img.shields.io/npm/v/tst-reflect.svg?color=brightgreen&style=flat-square&logo=npm&label=tst-reflect)](https://www.npmjs.com/package/tst-reflect)
[![tst-reflect-transformer](https://img.shields.io/npm/v/tst-reflect-transformer.svg?color=brightgreen&style=flat-square&logo=npm&label=tst-reflect-transformer)](https://www.npmjs.com/package/tst-reflect-transformer)
[![License MIT](https://img.shields.io/badge/License-MIT-brightgreen?style=flat-square)](https://opensource.org/licenses/MIT)

This is TypeScript transformer generating Type objects that are working at runtime, providing metadata about types such as list of properties and their types, list of constructors and their parameters
and their types and much more.

**Working runtime generics!**

Simple example:

```typescript
import { getType } from "tst-reflect";

function inferType<TType>() {
    return getType<TType>().name;
}

const variable = 5;
inferType<typeof variable>(); // "number" - but it is a number literal with value 5, more info in docs.
```

or

```typescript
import { getType } from "tst-reflect";

/** @reflectGeneric */
function inferType<TType>(val: TType) {
    return getType<TType>().name;
}

const variable = 5;
inferType(variable); // "number"; thanks to @reflectGeneric JSDoc, you don't have to pass generic param.
```

More in [README](https://github.com/Hookyns/ts-reflection) in root repository folder.

## How to start

`npm i tst-reflect && npm i tst-reflect-transformer -D`

In order to use transformer plugin you will need TypeScript compiler which support plugins (if you don't want to write custom compiler via TypeScript API on your own), eg.
package [ttypescript](https://www.npmjs.com/package/ttypescript).

`npm i ttypescript -D`

Now just add transformer to `tsconfig.json` and run `npx ttsc` instead of `tsc`.

```json5
{
    "compilerOptions": {
        // your options...

        // ADD THIS!
        "plugins": [
            {
                "transform": "tst-reflect-transformer"
            }
        ]
    }
}
```

or with Webpack

```javascript
({
    test: /\.(ts|tsx)$/,
    loader: require.resolve("awesome-typescript-loader"),
    // or loader: require.resolve("ts-loader"),
    options: {
        compiler: "ttypescript"
    }
})
```

## Obtaining Type

This package contains two main exports, `getType<T>()` function and `Type` class. To get `Type` instance, just call `getType<InterfaceOrClassOrSomeType>()`.

## How does it work

Transformer looks for all calls of `getType<T>()` and replace those calls by `Type` retrieving logic. It generates object literals describing referred types and instances of `Type`
are created from those objects.

### Metadata

Mentioned object literals describing types are called **metadata**. Default behavior collect metadata of all used types and generate file `metadata.lib.js` in project root (
location of tsconfig.json).

Metadata library file looks like this:

```javascript
var {getType} = require("tst-reflect");
getType({
    k: 5,
    props: [{n: "foo", t: getType({n: "string", k: 2})}, {
        n: "bar",
        t: getType({k: 3, types: [getType({k: 6, v: "a"}), getType({k: 6, v: "b"})], union: true, inter: false})
    }]
}, 22974);
getType({k: 5, props: [{n: "foo", t: getType({n: "string", k: 2})}, {n: "bar", t: getType({n: "string", k: 2})}]}, 22969);
getType({
    n: "SomeType",
    fn: "..\\logger.ts:SomeType",
    props: [{n: "array", t: getType({k: 4, n: "Array", args: [getType(22969)]})}],
    ctors: [{params: []}],
    k: 1,
    ctor: () => SomeType
}, 22965);
getType({
    n: "Foo",
    fn: "..\\logger.ts:Foo",
    props: [{n: "prop", t: getType({n: "number", k: 2})}],
    ctors: [{params: [{n: "prop", t: getType({n: "number", k: 2})}]}],
    k: 1,
    ctor: () => Foo
}, 22976);
```

### Configuration

There is an optional configuration you can set in `tsconfig.json` file.

```json5
{
    "compilerOptions": {
        // ...
    },
    "reflection": {
        "metadata": false,
        // false | string, default "./metadata.lib.js"
        "debugMode": true
        // boolean, default "false"
    }
}
```

Property `metadata: false | string` allows you to switch behavior. Default behavior generates metadata library file. You can change name and/or location of this file by setting own path. Or you can
set `false` to disable generation of that file; metadata will be separated in files where they are used. Metadata can be redundant if same types are used in more files.

## Examples

Watch Examples section in the main [README](https://github.com/Hookyns/ts-reflection#examples) of the repository.

## License

This project is licensed under the [MIT license](./LICENSE).