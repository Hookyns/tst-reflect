# Runtime Part of TypeScript Transformer for Runtime Types & Reflection (tst-reflect)

[![tst-reflect](https://img.shields.io/npm/v/tst-reflect.svg?color=brightgreen&style=flat-square&logo=npm&label=tst-reflect)](https://www.npmjs.com/package/tst-reflect)
[![tst-reflect-transformer](https://img.shields.io/npm/v/tst-reflect-transformer.svg?color=brightgreen&style=flat-square&logo=npm&label=tst-reflect-transformer)](https://www.npmjs.com/package/tst-reflect-transformer)
[![License MIT](https://img.shields.io/badge/License-MIT-brightgreen?style=flat-square)](https://opensource.org/licenses/MIT)

This package is runtime part of `tst-reflect-transformer`, which is TypeScript transformer generating Type objects that are working at runtime, providing
metadata about types such as list of properties and their types, list of constructors and their parameters and their types and much more.

**Working runtime generics!**

Simple example:

```typescript
import { getType } from "tst-reflect";

function inferType<TType>() {
    return getType<TType>().name;
}

const variable = 5;
inferType<typeof variable>(); // "number"
```

or

```typescript
import { getType } from "tst-reflect";

/** @reflectGeneric */
function inferType<TType>(val: TType) {
    return getType<TType>().name;
}

const variable = 5;
inferType(variable); // "number"; thanks to @reflectGeneric, you don't have to pass generic param
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

This package contains two main exports, `getType<T>()` function and `Type` class. To get `Type` instance you have to call `getType<SomeTypeScriptType>()`.

## Synopsis

```typescript
/**
 * Object representing TypeScript type in memory
 */
export declare class Type
{
    static readonly Object: Type;

    /**
     * Returns information about generic conditional type.
     */
    get condition(): ConditionalType | undefined;

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
    get types(): ReadonlyArray<Type> | undefined;

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
     * Interface which this type implements
     */
    get interface(): Type | undefined;

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
     * Underlying value in case of literal type
     */
    get literalValue(): any;

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
     * Returns a value indicating whether the Type is an object literal or not
     */
    isObjectLiteral(): boolean;

    /**
     * Returns true if type is union or intersection of types
     */
    isUnionOrIntersection(): boolean;

    /**
     * Check if this type is a string
     */
    isString(): boolean;

    /**
     * Check if this type is a number
     */
    isNumber(): boolean;

    /**
     * Check if this type is a boolean
     */
    isBoolean(): boolean;

    /**
     * Check if this type is an array
     */
    isArray(): boolean;

    /**
     *
     * @return {boolean}
     */
    isObjectLike(): boolean;

    /**
     * Returns array of type parameters.
     */
    getTypeParameters(): ReadonlyArray<Type>;

    /**
     * Returns type arguments in case of generic type
     */
    getTypeArguments(): ReadonlyArray<Type>;

    /**
     * Returns constructor description when Type is a class
     */
    getConstructors(): ReadonlyArray<Constructor> | undefined;

    /**
     * Returns array of properties
     */
    getProperties(): ReadonlyArray<Property>;

    /**
     * Returns array of methods
     */
    getMethods(): ReadonlyArray<Method>;

    /**
     * Returns array of decorators
     */
    getDecorators(): ReadonlyArray<Decorator>;

    /**
     * Determines whether the class represented by the current Type derives from the class represented by the specified Type
     * @param {Type} classType
     */
    isSubclassOf(classType: Type): boolean;

    /**
     * Determines whether the current Type derives from the specified Type
     * @param {Type} targetType
     */
    isDerivedFrom(targetType: Type): boolean;

    /**
     * Determines whether the Object represented by the current Type is structurally compatible and assignable to the Object represented by the specified Type
     * @param {Type} target
     * @return {boolean}
     * @private
     */
    isStructurallyAssignableTo(target: Type): boolean;

    /**
     * Determines whether an instance of the current Type can be assigned to an instance of the specified Type.
     * @description This is fulfilled by derived types or compatible types.
     * @param target
     */
    isAssignableTo(target: Type): boolean;
}

export declare enum TypeKind
{
    Interface = 0,
    Class = 1,
    Native = 2,
    Container = 3,
    TransientTypeReference = 4,
    Object = 5,
    LiteralType = 6,
    Tuple = 7,
    TypeParameter = 8,
    ConditionalType = 9
}

export declare enum Accessor {
    None = 0,
    Getter = 1,
    Setter = 2
}
export declare enum AccessModifier {
    Private = 0,
    Protected = 1,
    Public = 2
}

export interface ConditionalType {
    /**
     * Extends type
     */
    extends: Type;
    /**
     * True type
     */
    trueType: Type;
    /**
     * False type
     */
    falseType: Type;
}

/**
 * Property description
 */
export interface Property {
    /**
     * Property name
     */
    name: string;
    /**
     * Property type
     */
    type: Type;
    /**
     * Property decorators
     */
    decorators: Array<Decorator>;
}

/**
 * Decoration description
 */
export interface Decorator {
    /**
     * Decorator name
     */
    name: string;
    /**
     * Decorator full name
     */
    fullName?: string;
}

/**
 * Method parameter description
 */
export interface MethodParameter {
    /**
     * Parameter name
     */
    name: string;
    /**
     * Parameter type
     */
    type: Type;
}

/**
 * Constructor description object
 */
export interface Constructor {
    /**
     * Constructor parameters
     */
    parameters: Array<MethodParameter>;
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

## Examples
Watch Examples section in the main [README](https://github.com/Hookyns/ts-reflection#examples) of the repository.

## License
This project is licensed under the [MIT license](./LICENSE).