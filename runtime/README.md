# Runtime of TypeScript Transformer for Runtime Types & Reflection (tst-reflect)
This package is runtime part of `tst-reflect-transformer`, which is TypeScript transformer generating Type objects that are working in runtime, providing meta data about types such as list of properties and their types, list of constructors and their parameters and their types and much more.

# How to start
`npm i tst-reflect && npm i tst-reflect-transformer ttypescript -D`

## Modify tsconfig.json
Add `plugins` property into compilerOptions block.
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

## Obtaining Type
This package contains two main exports, `getType<T>()` function and `Type` class.
To get `Type` instance, just call `getType<InterfaceClassOrSomeType>()`.

# Synopsis
> class Type {}
```typescript
/**
 * Object representing TypeScript type in memory
 */
export declare class Type {
    /**
     * Returns a value indicating whether the Type is container for unified Types or not
     */
    get isUnion(): boolean;

    /**
     * Returns a value indicating whether the Type is container for intersecting Types or not
     */
    get isIntersection(): boolean;

    /**
     * List of underlying types in case Type is union or intersection
     */
    get types(): Array<Type> | undefined;

    /**
     * Constructor function in case that Type is class
     */
    get ctor(): Function | undefined;

    /**
     * Get type full-name
     * @description Contains file path base to project root. It is unique identifier.
     */
    get fullName(): string;

    /**
     * Get type name
     */
    get name(): string;

    /**
     * Get kind of type
     */
    get kind(): TypeKind;

    /**
     * Returns true if types are equals
     * @param type
     */
    is(type: Type): boolean;

    /**
     * Returns a value indicating whether the Type is a class or not
     */
    isClass(): boolean;

    /**
     * Returns a value indicating whether the Type is a interface or not
     */
    isInterface(): boolean;

    /**
     * Returns constructor description when Type is a class
     */
    getConstructors(): Array<Constructor> | undefined;

    /**
     * Returns array of properties
     */
    getProperties(): Array<Property>;

    /**
     * Returns array of decorators
     */
    getDecorators(): Array<Decorator>;
}
```

> function getType<T>()
```typescript
/**
 * Returns Type of generic parameter
 */
export declare function getType<T>(): Type;
```

# How does it work
Transformer looks for all calls of `getType<T>()` and replace those call by `Type` retrieving logic.
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