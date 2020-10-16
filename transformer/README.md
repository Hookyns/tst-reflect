# TypeScript Transformer for Runtime Types & Reflection (tst-reflect-transformer)
> This package is compile/transpile time part of `tst-reflect`.

[![tst-reflect](https://img.shields.io/npm/v/tst-reflect.svg?color=brightgreen&style=flat-square&logo=npm&label=tst-reflect)](https://www.npmjs.com/package/tst-reflect) 
[![tst-reflect-transformer](https://img.shields.io/npm/v/tst-reflect-transformer.svg?color=brightgreen&style=flat-square&logo=npm&label=tst-reflect-transformer)](https://www.npmjs.com/package/tst-reflect-transformer)
[![License MIT](https://img.shields.io/badge/License-MIT-brightgreen?style=flat-square)](https://opensource.org/licenses/MIT)


This is TypeScript transformer generating Type objects that are working at runtime, providing meta data about types such as list of properties and their types, list of constructors and their parameters and their types and much more.

More in [README](https://github.com/Hookyns/ts-reflection) in root repository folder.

## How to start
`npm i tst-reflect && npm i tst-reflect-transformer -D`

In order to use transformer plugin you will need TypeScript compiler which support plugins (if you don't want to write custom compiler via TypeScript API on your own), eg. package [ttypescript](https://www.npmjs.com/package/ttypescript).

`npm i ttypescript -D`

Now just add transformer to `tsconfig.json` and run `ttsc` instead of `tsc`.
```json5
{
  "compilerOptions": {
    // your options...

    // ADD THIS!
    "plugins": [
      { "transform": "tst-reflect-transformer" }
    ]
  }
}
```

and with Webpack
```javascript
{
    test: /\.(ts|tsx)$/,
    loader: require.resolve("awesome-typescript-loader"),
    // or
    loader: require.resolve("ts-loader"),
    options: {
        compiler: "ttypescript"
    }
}
```

### Obtaining Type
This package contains two main exports, `getType<T>()` function and `Type` class.
To get `Type` instance, just call `getType<InterfaceOrClassOrSomeType>()`.

## How does it work
Transformer looks for all calls of `getType<T>()` and replace those calls by `Type` retrieving logic.
It generates object literals describing referred types and instances of `Type` are created from those objects.

It use some kind of cache (per file; it's impossible for TS to get main runtime module and create cache there under GlobalThis; so it's in every file).

> index.ts
```typescript
import {getType}           from "tst-reflect";
import {IService, Service} from "./dependency";
import {ServiceCollection} from "./ServiceCollection";
import {ServiceProvider}   from "./serviceProvider";

const serviceCollection = new ServiceCollection();
serviceCollection.addTransient(getType<IService>(), getType<Service>());

const serviceProvider = new ServiceProvider(serviceCollection);

const s1 = serviceProvider.getService<IService>(getType<IService>());
console.log("Type created using reflection: ", s1);
```

Generated output
```javascript
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("tst-reflect");
const dependency_1 = require("./dependency");
const ServiceCollection_1 = require("./ServiceCollection");
const serviceProvider_1 = require("./serviceProvider");
types_1.getType({ n: "ILogger", fn: "..\\dependency.ts:ILogger", decs: [], k: 0 }, 30613);
types_1.getType({ n: "IService", fn: "..\\dependency.ts:IService", k: 0}, 30614);
types_1.getType({ n: "Service", fn: "..\\dependency.ts:Service", ctors: [{ params: [{ n: "logger", t: types_1.getType(30613) }] }], decs: [{ n: "injectable" }], k: 1, ctor: () => dependency_1.Service }, 30617);
const serviceCollection = new ServiceCollection_1.ServiceCollection();
serviceCollection.addTransient(types_1.getType(30614), types_1.getType(30617));
const serviceProvider = new serviceProvider_1.ServiceProvider(serviceCollection);
```

## License
This project is licensed under the MIT license.