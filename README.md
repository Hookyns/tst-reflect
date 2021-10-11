# JavaScript(/TypeScript) Runtime Reflection and Generics (tst-reflect)

> **The repository of TypeScript runtime reflection packages.**

[![tst-reflect](https://img.shields.io/npm/v/tst-reflect.svg?color=brightgreen&style=flat-square&logo=npm&label=tst-reflect)](https://www.npmjs.com/package/tst-reflect)
[![tst-reflect-transformer](https://img.shields.io/npm/v/tst-reflect-transformer.svg?color=brightgreen&style=flat-square&logo=npm&label=tst-reflect-transformer)](https://www.npmjs.com/package/tst-reflect-transformer)
[![License MIT](https://img.shields.io/badge/License-MIT-brightgreen?style=flat-square)](https://opensource.org/licenses/MIT)

[![Readme Card](https://github-readme-stats.vercel.app/api/pin/?username=hookyns&repo=ts-reflection&theme=tokyonight)](https://github.com/Hookyns/ts-reflection)

[Example](#show-me-some-code) | [Synopsis](#synopsis) | [How to start](#how-to-start)

## About

Yeap! How the title says, this project is about runtime **reflection** with working **generic** types, 
achieved using custom TypeScript transformer plugin (package `tst-reflect-transformer`) 
and runtime stuff (package `tst-reflect`).

More info inside the corresponding folders, see `transformer`, `runtime`.

## Show Me Some Code!

Here you are! Dependency Injection from scratch.
[![Run on repl.it](https://repl.it/badge/github/Hookyns/tst-reflect-example-01.git)](https://repl.it/github/Hookyns/tst-reflect-example-01.git)

<details><summary>Click to expand!</summary>
<p>

```typescript
import {
    getType,
    Type
} from "tst-reflect";

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
    private readonly serviceCollection: ServiceCollection;

    constructor(serviceCollection: ServiceCollection)
    {
        this.serviceCollection = serviceCollection;
    }

    getService<TDependency>(type?: Type): TDependency
    {
        if (type === undefined) 
        {
            type = getType<TDependency>();
        }
    
        // Find implementation of type
        const [, impl] = this.serviceCollection.services.find(([dep]) => dep.is(type));

        if (!impl)
        {
            throw new Error(`No implementation registered for '${type.name}'`);
        }

        if (!(impl instanceof Type))
        {
            return impl;
        }

        if (!impl.isClass())
        {
            throw new Error("Registered implementation is not class.");
        }

        // Parameter-less
        if (!impl.getConstructors()?.length)
        {
            return Reflect.construct(impl.ctor, []);
        }

        // Ctor with less parameters preferred
        const ctor = impl.getConstructors().sort((a, b) => a.parameters.length > b.parameters.length ? 1 : 0)[0];

        // Resolve parameters
        const args = ctor.parameters.map(param => this.getService(param.type))

        return Reflect.construct(impl.ctor, args);
    }
}

interface IPrinter
{
    printHelloWorld();

    printText(text: string);
}

abstract class BasePrinter implements IPrinter
{
    abstract printHelloWorld();

    abstract printText(text: string);
}

class ConsolePrinter extends BasePrinter implements IPrinter
{
    private readonly console: Console;

    constructor(console: Console)
    {
        super();
        this.console = console;
    }

    printHelloWorld()
    {
        this.console.log("Hello World!")
    }

    printText(text: string)
    {
        this.console.log(text)
    }
}

//-----------------------------------------

const collection = new ServiceCollection();

collection.addTransient(getType<Console>(), console);
collection.addTransient<IPrinter, ConsolePrinter>(); // Working runtime generic!!

const provider = new ServiceProvider(collection);

//-----------------------------------------

const printer = provider.getService<IPrinter>();
console.log("printer is instanceof ConsolePrinter:", printer instanceof ConsolePrinter);

printer.printHelloWorld();
printer.printText("Try it on repl.it");
printer.printText("And good bye!");
```

</p>
</details>

<details><summary>Generated JavaScript code</summary>
<p>

```javascript
"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const tst_reflect_1 = require("tst-reflect");
tst_reflect_1.getType({
    n: "Console",
    fn: "W:/tst-reflect/dev/node_modules/typescript/lib/lib.dom.d.ts:Console",
    props: [{n: "memory", t: tst_reflect_1.getType({n: "any", fn: "any", k: 2})}],
    k: 0
}, 20580);
tst_reflect_1.getType({n: "IPrinter", fn: "W:/tst-reflect/dev/example1.ts:IPrinter", k: 0}, 23131);
tst_reflect_1.getType({
    n: "BasePrinter",
    fn: "W:/tst-reflect/dev/example1.ts:BasePrinter",
    ctors: [{params: []}],
    k: 1,
    iface: tst_reflect_1.getType(23131)
}, 23133);
tst_reflect_1.getType({
    n: "ConsolePrinter",
    fn: "W:/tst-reflect/dev/example1.ts:ConsolePrinter",
    props: [{n: "console", t: tst_reflect_1.getType(20580)}],
    ctors: [{params: [{n: "console", t: tst_reflect_1.getType(20580)}]}],
    k: 1,
    ctor: () => ConsolePrinter,
    bt: tst_reflect_1.getType(23133)
}, 23139);

class ServiceCollection {
    constructor() {
        this.services = [];
    }

    foo(foo, __genericParams__) {
        return __genericParams__.A;
    }

    addTransient(dependencyType, dependencyImplementation, __genericParams__) {
        this.services.push([dependencyType ?? __genericParams__.TDep, dependencyImplementation ?? __genericParams__.TImp]);
    }
}

class ServiceProvider {
    constructor(serviceCollection) {
        this.serviceCollection = serviceCollection;
    }

    getService(type) {
        const [, impl] = this.serviceCollection.services.find(([dep]) => dep.is(type));
        if (!impl) {
            throw new Error(`No implementation registered for '${type.name}'`);
        }
        if (!(impl instanceof tst_reflect_1.Type)) {
            return impl;
        }
        if (!impl.isClass()) {
            throw new Error("Registered implementation is not class.");
        }
        if (!impl.getConstructors()?.length) {
            return Reflect.construct(impl.ctor, []);
        }
        const ctor = impl.getConstructors().sort((a, b) => a.parameters.length > b.parameters.length ? 1 : 0)[0];
        const args = ctor.parameters.map(param => this.getService(param.type));
        return Reflect.construct(impl.ctor, args);
    }
}

class BasePrinter {
}

class ConsolePrinter extends BasePrinter {
    constructor(console) {
        super();
        this.console = console;
    }

    printHelloWorld() {
        this.console.log("Hello World!");
    }

    printText(text) {
        this.console.log(text);
    }
}

const collection = new ServiceCollection();
collection.addTransient(undefined, undefined, {TDep: tst_reflect_1.getType(23131), TImp: tst_reflect_1.getType(23139)});
collection.addTransient(tst_reflect_1.getType(20580), console);
const provider = new ServiceProvider(collection);
const printer = provider.getService(tst_reflect_1.getType(23131));
console.log("printer is instanceof ConsolePrinter:", printer instanceof ConsolePrinter);
printer.printHelloWorld();
printer.printText("Try it on repl.it");
printer.printText("And good bye!");
```

</p>
</details>

### Short Explanation

There are two interesting parts in the example. First part is at the bottom, where `getType<T>()` call is. This function is imported from runtime package and
its return type is `Type` which is class imported from runtime package too.
`getType<T>()` is Alpha of the package. That's how you get your `Type`, the Omega of the package.

Second part is somewhere in the middle in method `getService<T>()` of `ServiceProvider` class where you can see some operations with `Type`.
Type details in [Synopsis](#synopsis).

## Synopsis

```typescript
export declare enum TypeKind
{
    Interface = 0,
    Class = 1,
    Native = 2,
    Container = 3,
    TransientTypeReference = 4,
    Object = 5,
    LiteralType = 6
}

export interface MethodParameter
{
    name: string;
    type: Type;
}

export interface Property
{
    name: string;
    type: Type;
}

export interface Decorator
{
    name: string;
    fullName?: string;
}

export interface Constructor
{
    parameters: Array<MethodParameter>;
}

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
}
```

## How to start

`npm i tst-reflect && npm i tst-reflect-transformer -D`

In order to use transformer plugin you need TypeScript compiler which support plugins (if you don't want to write custom compiler via TypeScript API on
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

and with Webpack

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

## Motivation

I'm developing this for own Dependency Injection system, to allow registering and resolving based on types. Something like:

```
serviceCollection.AddScoped<ILog, Log>();
...
serviceProvider.Resolve<ILog>();
```

Where resolve() take care about constructors parameters, based on their types, and resolve everything.

## Known Issues

* Order of generated meta can be wrong in case of circular modules.

## License
This project is licensed under the [MIT license](./LICENSE).
