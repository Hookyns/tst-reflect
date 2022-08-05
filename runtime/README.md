<h1>Runtime Types & Reflection (tst-reflect) <sub><i>runtime part</i></sub></h1>

[![tst-reflect](https://img.shields.io/npm/v/tst-reflect.svg?color=brightgreen&style=flat-square&logo=npm&label=tst-reflect)](https://www.npmjs.com/package/tst-reflect)
[![tst-reflect-transformer](https://img.shields.io/npm/v/tst-reflect-transformer.svg?color=brightgreen&style=flat-square&logo=npm&label=tst-reflect-transformer)](https://www.npmjs.com/package/tst-reflect-transformer)
[![License MIT](https://img.shields.io/badge/License-MIT-brightgreen?style=flat-square)](https://opensource.org/licenses/MIT)

This package is runtime part of `tst-reflect-transformer`, which is TypeScript transformer/plugin generating Type metadata objects that are working at runtime, providing
information about types such as list of properties and their types, list of constructors and their parameters and types and so on.

**With working runtime generic types!**


[Visit Github repository for more information](https://github.com/Hookyns/tst-reflect)

## How to Get Type?
```typescript
import { getType } from "tst-reflect";

interface IFoo {}
class Foo implements IFoo {}

getType<IFoo>();
getType<Foo>();
getType(Foo);

const foo = new Foo();
getType<typeof foo>();
getType(foo);
```

## Simple Example

```typescript
import { getType, Type } from "tst-reflect";

function printClassInfo<TType>()
{
    const type: Type = getType<TType>(); // <<== get type of generic TType

    console.log(type.name); // > Animal
    console.log(type.fullName); // > @@this/index.ts:Animal#21869

    console.log(type.getProperties().map(p => `${p.name}: ${p.type.name}`).join("\n")); // > name: string
    console.log(type.getMethods().map(m => `${m.name}(): ${m.returnType.name}`).join("\n")); // > makeSound(): string

    return type.name;
}

abstract class Animal
{
    private name: string;
    abstract makeSound(): string;
}

printClassInfo<Animal>();
```

## How to Start

1. Install packages.
```
npm i tst-reflect && npm i tst-reflect-transformer -D
```


2. In order to use transformer plugin you need TypeScript compiler which supports plugins eg. package [ttypescript](https://www.npmjs.com/package/ttypescript) or you can use [TypeScript compiler API](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API) manually.
```
npm i ttypescript -D
```


3. Add transformer to `tsconfig.json`
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
4. Now just transpile your code by `ttsc` instead of `tsc`
```
npx ttsc
```

### Using Webpack
Modify your webpack config. Use `options.compiler` of `ts-loader` to set `ttypescript` compiler.
```javascript
({
    test: /\.(ts|tsx)$/,
    loader: require.resolve("ts-loader"),
    options: {
        compiler: "ttypescript"
    }
})
```

### Using Parcel
Install Parcel plugin.
```
npm i parcel-plugin-ttypescript
```

### Using Rollup
Install Rollup plugin
```
npm i rollup-plugin-typescript2
```
and modify your rollup config.
```javascript
import ttypescript from "ttypescript";
import tsPlugin from "rollup-plugin-typescript2";

export default {
    // your options...
    
    plugins: [
        // ADD THIS!
        tsPlugin({
            typescript: ttypescript
        })
    ]
}
```

### Using ts-node
Modify your `tsconfig.json`.
```json5
{
    "compilerOptions": {
        // your options...

        "plugins": [
            {
                "transform": "tst-reflect-transformer"
            }
        ]
    },
    
    // ADD THIS!
    "ts-node": {
        // This can be omitted when using ts-patch
        "compiler": "ttypescript"
    },
}
```

## Obtaining Type

Runtime package (`tst-reflect`) contains two main exports, `getType<T>()` function and `Type` class. To get `Type` instance, you have to call `getType<InterfaceOrClassOrSomeType>()`.

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

## Configuration
[Configuration [wiki]](https://github.com/Hookyns/tst-reflect/wiki/Configuration)


## More Information

More information in [README](https://github.com/Hookyns/tst-reflect) in the root repository folder.

Or check [examples](https://github.com/Hookyns/tst-reflect/tree/main/examples)
or [dev scripts](https://github.com/Hookyns/tst-reflect/tree/main/dev) we use to test things.

## License
This project is licensed under the [MIT license](./LICENSE).