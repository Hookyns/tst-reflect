# Runtime Part of TypeScript Transformer for Runtime Types & Reflection (tst-reflect)

[![tst-reflect](https://img.shields.io/npm/v/tst-reflect.svg?color=brightgreen&style=flat-square&logo=npm&label=tst-reflect)](https://www.npmjs.com/package/tst-reflect)
[![tst-reflect-transformer](https://img.shields.io/npm/v/tst-reflect-transformer.svg?color=brightgreen&style=flat-square&logo=npm&label=tst-reflect-transformer)](https://www.npmjs.com/package/tst-reflect-transformer)
[![License MIT](https://img.shields.io/badge/License-MIT-brightgreen?style=flat-square)](https://opensource.org/licenses/MIT)

This package is runtime part of `tst-reflect-transformer`, which is TypeScript transformer generating Type objects that are working at runtime, providing
metadata about types such as list of properties and their types, list of constructors and their parameters and their types and much more.

**Working runtime generics!**

Simple example:

```typescipt
import { getType } from "tst-reflect";

function inferType<TType>() {
    return getType<TType>().name;
}

const variable = 5;
inferType<typeof variable>(); // "number" - but it is and number literal with value 5, more info in docs
```

or

```typescipt
import { getType } from "tst-reflect";

/** @reflectGeneric */
function inferType<TType>(val: TType) {
    return getType<TType>().name;
}

const variable = 5;
inferType(variable); // "number"; thanks to @reflectGeneric, you don't have to pass generic param, but it is not recomended.
```

More in [README](https://github.com/Hookyns/ts-reflection) in root repository folder too.

## How to start

`npm i tst-reflect && npm i tst-reflect-transformer -D`

In order to use transformer plugin you will need TypeScript compiler which support plugins (if you don't want to write custom compiler via TypeScript API on
your own), eg. package [ttypescript](https://www.npmjs.com/package/ttypescript).

`npm i ttypescript -D`

Now just add transformer to `tsconfig.json` and run `ttsc` instead of `tsc`.

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
    // or
    loader: require.resolve("ts-loader"),
    options: {
        compiler: "ttypescript"
    }
})
```

### Obtaining Type

This package contains two main exports, `getType<T>()` function and `Type` class. To get `Type` instance, just call `getType<InterfaceOrClassOrSomeType>()`.

## Synopsis

```typescript
/**
 * Object representing TypeScript type in memory
 */
export declare class Type
{
    /**
     * Returns a value indicating whether the Type is container for unified Types or not
     */
    get union(): boolean;

    /**
     * Returns a value indicating whether the Type is container for intersecting Types or not
     */
    get intersection(): boolean;

    /**
     * List of underlying types in case Type is union or intersection
     */
    get types(): Array<Type> | undefined;

    /**
     * Constructor function in case Type is class
     */
    get ctor(): Function | undefined;

    /**
     * Base type
     * @description Base type from which this type extends from or undefined if type is Object.
     */
    get baseType(): Type | undefined;

    /**
     * Get type full-name
     * @description Contains file path base to project root
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
     * Returns a value indicating whether the Type is an literal or not
     */
    isLiteral(): boolean;

    /**
     * Get underlying value in case of literal type
     */
    getLiteralValue(): any;

    /**
     * Returns a value indicating whether the Type is an object literal or not
     */
    isObjectLiteral(): boolean;

    /**
     * Return type arguments in case of generic type
     */
    getTypeArguments(): Array<Type>;

    /**
     * Returns constructor description when Type is a class
     */
    getConstructors(): Array<Constructor> | undefined;

    /**
     * Returns interface which this type implements
     */
    getInterface(): Type | undefined;

    /**
     * Returns array of properties
     */
    getProperties(): Array<Property>;

    /**
     * Returns array of decorators
     */
    getDecorators(): Array<Decorator>;

    /**
     * Returns true if this type is assignable to target type
     * @param target
     */
    isAssignableTo(target: Type): boolean;

    /**
     * Check if this type is string
     */
    isString(): boolean;

    /**
     * Check if this type is number
     */
    isNumber(): boolean;

    /**
     * Check if this type is boolean
     */
    isBoolean(): boolean;
}
```

```typescript
/**
 * Returns Type of generic parameter
 */
export declare function getType<T>(): Type;
```

## How does it work

Transformer looks for all calls of `getType<T>()` and replace those calls by `Type` retrieving logic. It generates object literals describing referred types and
instances of `Type` are created from those objects.

It use some kind of cache (per file; it's impossible for TS to get main runtime module and create cache there under GlobalThis; so it's in every file).

> example.ts

```typescript
import {
    getType,
    Type
} from "tst-reflect";
import {
    IService,
    Service
} from "./dependency";

class ServiceCollection
{
    public readonly services: Array<[Type, any]> = [];

    addTransient<TDep, TImp>(dependencyType?: Type, dependencyImplementation?: Type | any)
    {
        this.services.push([dependencyType ?? getType<TDep>(), dependencyImplementation ?? getType<TImp>()]);
    }
}

class ServiceProvider
{
    // ...
}

const serviceCollection = new ServiceCollection();
serviceCollection.addTransient(getType<IService>(), getType<Service>());
// or with generic
serviceCollection.addTransient<IService, Service>();

const serviceProvider = new ServiceProvider(serviceCollection);

const s1 = serviceProvider.getService<IService>();
console.log("Type created using reflection: ", s1);
console.log("s1 is instanceof Service: ", s1 instanceof Service); // true
```

Generated output

```javascript
const tst_reflect_1 = require("tst-reflect");
const dependency_1 = require("./dependency");
tst_reflect_1.getType({n: "ILogger", fn: "W:/tst-reflect/dev/dependency.ts:ILogger", k: 0}, 22961);
tst_reflect_1.getType({
    n: "IService",
    fn: "W:/tst-reflect/dev/dependency.ts:IService",
    props: [{
        n: "prop",
        t: tst_reflect_1.getType({
            k: 3,
            types: [tst_reflect_1.getType({n: "string", fn: "string", k: 2}), tst_reflect_1.getType({n: "number", fn: "number", k: 2})],
            union: true,
            inter: false
        })
    }],
    k: 0
}, 22963);
tst_reflect_1.getType({
    n: "Service",
    fn: "W:/tst-reflect/dev/dependency.ts:Service",
    props: [{
        n: "prop",
        t: tst_reflect_1.getType({
            k: 3,
            types: [tst_reflect_1.getType({n: "string", fn: "string", k: 2}), tst_reflect_1.getType({n: "number", fn: "number", k: 2})],
            union: true,
            inter: false
        })
    }, {n: "logger", t: tst_reflect_1.getType(22961), d: [{n: "inject"}]}, {n: "Logger", t: tst_reflect_1.getType(22961)}],
    ctors: [{params: [{n: "logger", t: tst_reflect_1.getType(22961)}]}],
    decs: [{n: "injectable"}],
    k: 1,
    ctor: () => dependency_1.Service,
    iface: tst_reflect_1.getType(22963)
}, 22965);

class ServiceCollection {
    constructor() {
        this.services = [];
    }

    addTransient(dependencyType, dependencyImplementation, __genericParams__) {
        this.services.push([dependencyType ?? __genericParams__.TDep, dependencyImplementation ?? __genericParams__.TImp]);
    }
}

class ServiceProvider {
    // ...
}

const serviceCollection = new ServiceCollection();
serviceCollection.addTransient(tst_reflect_1.getType(22963), tst_reflect_1.getType(22965));
serviceCollection.addTransient({TDep: tst_reflect_1.getType(22963), TImp: tst_reflect_1.getType(22965)});
const serviceProvider = new ServiceProvider(serviceCollection);
const s1 = serviceProvider.getService({TDependency: tst_reflect_1.getType(22963)});
console.log("Type created using reflection: ", s1);
console.log("s1 is instanceof Service: ", s1 instanceof dependency_1.Service);
```

## License

This project is licensed under the MIT license.