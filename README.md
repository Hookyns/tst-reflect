# TypeScript Transformer for Runtime Reflection

[![Run on repl.it](https://repl.it/badge/github/Hookyns/ts-reflection.git)](https://repl.it/github/Hookyns/ts-reflection.git)

This package provide method `getType<T>()` which is handled and transformed into `Type` instance which describe given type `T`.

Work in progress...!

## Example
```typescript
class Foo {
    private readonly log: ILog;
    
    constructor(log: ILog) {
        this.log = log;
    }
}

const type: Type = getType<Foo>();
```



## Synopsis
```typescript
export declare enum TypeKind {
    Interface = 0,
    Class = 1,
    Native = 2,
    Container = 3
}
export interface MethodParameter {
    name: string;
    type: Type;
}
export interface Property {
    name: string;
    type: Type;
}
export interface Decorator {
    name: string;
    fullName?: string;
}
export interface Constructor {
    parameters: Array<MethodParameter>;
}
export declare class Type {
    get isUnion(): boolean;
    get isIntersection(): boolean;
    get types(): Array<Type> | undefined;
    get fullName(): string;
    get name(): string;
    get kind(): TypeKind;
    isClass(): boolean;
    isInterface(): boolean;
    getConstructors(): Array<Constructor> | null;
    getProperties(): Array<Property>;
    getDecorators(): Array<Decorator>;
}
```

### Note
I'm developing this for own Dependency Injection system, to allow registering and resolving based on types. Something like:
```
serviceCollection.AddScoped<ILog, Log>();
...
serviceProvider.Resolve<ILog>();
```

Where resolve() take care about constructors parameters, based on their types, and resolve everything.
