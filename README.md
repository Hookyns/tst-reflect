# JavaScript(/TypeScript) Runtime Types & Reflection (tst-reflect)
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

> **The mono repository of TypeScript runtime reflection packages.**

[![tst-reflect](https://img.shields.io/npm/v/tst-reflect.svg?color=brightgreen&style=flat-square&logo=npm&label=tst-reflect)](https://www.npmjs.com/package/tst-reflect)
[![tst-reflect-transformer](https://img.shields.io/npm/v/tst-reflect-transformer.svg?color=brightgreen&style=flat-square&logo=npm&label=tst-reflect-transformer)](https://www.npmjs.com/package/tst-reflect-transformer)
[![License MIT](https://img.shields.io/badge/License-MIT-brightgreen?style=flat-square)](https://opensource.org/licenses/MIT)
![License MIT](./coverage/badge.svg)

[![Readme Card](https://github-readme-stats.vercel.app/api/pin/?username=hookyns&repo=ts-reflection&theme=tokyonight)](https://github.com/Hookyns/ts-reflection)

[Examples](#examples) | [Synopsis](#synopsis) | [How to start](#how-to-start) | [How does it work](#how-does-it-work) | [Configuration [wiki]](https://github.com/Hookyns/ts-reflection/wiki/Configuration) | [Changelog](https://github.com/Hookyns/ts-reflection/blob/main/CHANGELOG.md)

## About

Yeap! How the title says, this project is about runtime **reflection** with working **generic** types, 
achieved using custom TypeScript transformer plugin (package `tst-reflect-transformer`) 
and runtime stuff (package `tst-reflect`).

### Features
- clear Reflection system, generating JS metadata library - can be de facto standard for TS reflection,
- you can use regular TypeScript,
- no decorators nor any other kind of hints needed,
- no problem with the types from 3rd party packages,
- no pre-implemented features like validators or type-guards, just clear type information. All these features can be built on top of this package in runtime,
- you can get the runtime type of the generic type, really!
- you can access the type of the class in your own decorators,
- you can get the type of a classes, interfaces, type literals, unions, intersections just all of that `getType<SomeType>()`,
- you can get the type of runtime value stored in variable `getType(myVar)`,
- object oriented usage - you will get instance of the `Type` class, which contains everything,
- inspired by the C# reflection - usage is very similar,
- overloads of a constructors and methods supported,
- static API to lookup types,
- access to constructors of all the types - you can instantiate every type,
- configuration with multiple options,
- browser usage,
- you can check if one type is assignable to another without instances of those type - eg. check if some class is assignable to some interface,
- and there are probably more... and a lot of things are on TODO list.

## How to Get the Type
Use function `getType<TType>(): Type` imported from module `tst-reflect`.

### Base Usage
```typescript
import { getType, Type } from "tst-reflect";

interface IAnimal
{
    name: string;
}

class Animal implements IAnimal
{
    constructor(public name: string)
    {
    }
}

const typeOfIAnimal: Type = getType<IAnimal>();
const typeOfAnimal: Type = getType<Animal>();

console.log(typeOfAnimal.isAssignableTo(typeOfIAnimal)); // true
```

### Get Type of Generic Type Parameter (runtime)
```typescript
import { getType } from "tst-reflect";

function printTypeProperties<TType>() 
{
    const type = getType<TType>(); // <<== get type of generic TType
    
    console.log(type.getProperties().map(prop => prop.name + ": " + prop.type.name).join("\n"));
}

interface SomeType {
    foo: string;
    bar: number;
    baz: Date;
}

printTypeProperties<SomeType>();
```

Output:
```
foo: string
bar: number
baz: Date
```

### Decorator With Reflected Generic Type

`tst-reflect-transformer` is able to process class decorators marked by @reflect JSDoc tag.
You will be able to get `Type` of each decorated class.

```typescript
/**
 * @reflect
 */
export function inject<TType>()
{
    const typeofClass = getType<TType>();

    return function <TType extends { new(...args: any[]): {} }>(Constructor: TType) {
        return class extends Constructor
        {
            constructor(...args: any[])
            {
                super(...type.getConstructors()[0].parameters.map(param => serviceProvider.getService(param.type)));
            }
        }
    };
}

@inject()
class A {}

@inject()
class B {}
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
_ts-node can be a little bugged if you use `reflection.metadata.type = "typelib"` option!_


## Examples
- [Example 01 - Dependency Injection](https://github.com/Hookyns/tst-reflect-example-01) [![Run on repl.it](https://repl.it/badge/github/Hookyns/tst-reflect-example-01.git)](https://repl.it/github/Hookyns/tst-reflect-example-01.git)

Feel free to add Your interesting examples. Just add a link to this README and make a PR.


## How Does it Work

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

## Synopsis

```typescript

/**
 * Object representing TypeScript type in memory
 */
export declare class Type
{
    static readonly Object: Type;
    static readonly Unknown: Type;
    static readonly Any: Type;
    static readonly Void: Type;
    static readonly String: Type;
    static readonly Number: Type;
    static readonly BigInt: Type;
    static readonly Boolean: Type;
    static readonly Date: Type;
    static readonly Null: Type;
    static readonly Undefined: Type;
    static readonly Never: Type;
    /**
     * Returns information about generic conditional type.
     */
    get condition(): ConditionalType | undefined;
    /**
     * Returns information about indexed access type.
     */
    get indexedAccessType(): IndexedAccessType | undefined;
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
    get types(): ReadonlyArray<Type>;
    /**
     * Constructor function in case Type is class
     */
    get ctor(): Function | undefined;
    /**
     * Get meta for the module of the defined constructor
     * This data is not set when the config mode is set to "universal"
     */
    get constructorDescription(): ConstructorImport | undefined;
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
     * Generic type constrains
     */
    get genericTypeConstraint(): Type | undefined;
    /**
     * Generic type default value
     */
    get genericTypeDefault(): any;
    /**
     * Search the type store for a specific type
     *
     * Runs the provided filter callback on each type. If your filter returns true, it returns this type.
     *
     * @param {(type: Type) => boolean} filter
     * @returns {Type | undefined}
     */
    static find(filter: (type: Type) => boolean): Type | undefined;
    /**
     * Returns all Types contained in metadata.
     * This method is quite useless with reflection.metadata.type = "inline"; Use "typelib" type.
     */
    static getTypes(): Type[];
    static get store(): MetadataStore;
    /**
     * Returns true if types are equals
     * @param type
     */
    is(type: Type): boolean;
    isInstantiable(): boolean;
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
     * Check if this is a native type ("string", "number", "boolean", "Array" etc.)
     */
    isNative(): boolean;
    /**
     * Check if this is a primitive type ("string", "number", "boolean" etc.)
     */
    isPrimitive(): boolean;
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
     * Determines whether the object represented by the current Type is an Enum.
     * @return {boolean}
     */
    isEnum(): boolean;
    /**
     * Returns information about the enumerable elements.
     */
    getEnum(): EnumInfo | undefined;
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
     * Returns object with all methods and properties from current Type and all methods and properties inherited from base types and interfaces to this Type.
     * @return {{properties: {[p: string]: Property}, methods: {[p: string]: Method}}}
     */
    flattenInheritedMembers(): {
        properties: {
            [propertyName: string]: Property;
        };
        methods: {
            [methodName: string]: Method;
        };
    };
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

/**
 * Kind of type
 */
export declare enum TypeKind
{
    /**
     * Interface
     */
    Interface = 0,
    /**
     * Class
     */
    Class = 1,
    /**
     * Native JavaScript/TypeScript type
     */
    Native = 2,
    /**
     * Container for other types in case of types union or intersection
     */
    Container = 3,
    /**
     * Type reference created during type checking
     * @description Usually Array<...>, ReadOnly<...> etc.
     */
    TransientTypeReference = 4,
    /**
     * Some specific object
     * @description Eg. "{ foo: string, bar: boolean }"
     */
    Object = 5,
    /**
     * Some subtype of string, number, boolean
     * @example <caption>type Foo = "hello world" | "hello"</caption>
     * String "hello world" is literal type and it is subtype of string.
     *
     * <caption>type TheOnlyTrue = true;</caption>
     * Same as true is literal type and it is subtype of boolean.
     */
    LiteralType = 6,
    /**
     * Fixed lenght arrays literals
     * @example <caption>type Coords = [x: number, y: number, z: number];</caption>
     */
    Tuple = 7,
    /**
     * Generic parameter type
     * @description Represent generic type parameter of generic types. Eg. it is TType of class Animal<TType> {}.
     */
    TypeParameter = 8,
    /**
     * Conditional type
     */
    ConditionalType = 9,
    /**
     * Indexed access type
     * @description Eg. get<K extends keyof TypeKind>(key: K): ==>> TypeKind[K] <<==
     */
    IndexedAccess = 10,
    /**
     * Typescript "module"
     * @description Value module or namespace module
     */
    Module = 11,
    /**
     * Specific method used as type
     */
    Method = 12,
    /**
     * Enum
     */
    Enum = 13
}

export declare enum Accessor
{
    None = 0,
    Getter = 1,
    Setter = 2
}

export declare enum AccessModifier
{
    Private = 0,
    Protected = 1,
    Public = 2
}

export interface ConditionalType
{
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
export interface Property
{
    /**
     * Property name
     */
    name: string;
    /**
     * Property type
     */
    type: Type;
    /**
     * Optional property
     */
    optional: boolean;
    /**
     * Property decorators
     */
    decorators: ReadonlyArray<Decorator>;
    /**
     * Access modifier
     */
    accessModifier: AccessModifier;
    /**
     * Accessor
     */
    accessor: Accessor;
    /**
     * Readonly
     */
    readonly: boolean;
}

/**
 * Decoration description
 */
export class Decorator {
    /**
     * Decorator name
     */
    name: string;
    /**
     * Decorator full name
     */
    fullName?: string;
    /**
     * List of literal arguments
     */
    getArguments(): Array<any>;
}

/**
 * Method parameter description
 */
export interface MethodParameter
{
    /**
     * Parameter name
     */
    name: string;
    /**
     * Parameter type
     */
    type: Type;
    /**
     * Parameter is optional
     */
    optional: boolean;
}

export declare class MethodBase
{
    /**
     * Parameters of this method
     */
    getParameters(): ReadonlyArray<MethodParameter>;
}

/**
 * Method details
 */
export declare class Method extends MethodBase
{
    /**
     * Name of this method
     */
    get name(): string;

    /**
     * Return type of this method
     */
    get returnType(): Type;

    /**
     * Method is optional
     */
    get optional(): boolean;

    /**
     * Access modifier
     */
    get accessModifier(): AccessModifier;

    /**
     * Returns list of generic type parameter.
     * @return {Array<Type>}
     */
    getTypeParameters(): ReadonlyArray<Type>;

    /**
     * Returns array of decorators
     */
    getDecorators(): ReadonlyArray<Decorator>;
}

/**
 * Constructor details
 */
export declare class Constructor extends MethodBase
{
}

export interface EnumInfo {
    /**
     * Get enum enumerators/items (keys).
     */
    getEnumerators(): string[];
    /**
     * Get values.
     */
    getValues(): any[];
    /**
     * Get enum entries (key:value pairs).
     */
    getEntries(): Array<readonly [enumeratorName: string, value: any]>;
}
```

## Contributors ✨

Thanks go to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://bitbucket.org/HookCZ/"><img src="https://avatars.githubusercontent.com/u/2551259?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Roman Jámbor</b></sub></a><br /><a href="https://github.com/hookyns/ts-reflection/commits?author=Hookyns" title="Code">💻</a> <a href="#maintenance-Hookyns" title="Maintenance">🚧</a> <a href="https://github.com/hookyns/ts-reflection/commits?author=Hookyns" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://allcontributors.org) specification.
Contributions of any kind are welcome!

## Motivation

I'm developing this Reflection system for [own Dependency Injection system](https://github.com/Hookyns/NetLeaf/tree/main/libraries/extensions-dependency-injection-typed), to allow registering and resolving based on types. Something like:

```
serviceCollection.addTransient<ILog, Log>();
...
serviceProvider.getService<ILog>();
```

Where `getService()` takes care about constructor's parameters, based on their types, and resolve everything.

## License
This project is licensed under the [MIT license](./LICENSE).
