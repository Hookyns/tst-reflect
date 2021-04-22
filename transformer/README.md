# TypeScript Transformer for Runtime Types & Reflection (tst-reflect-transformer)

> This package is compile/transpile time part of `tst-reflect`.

[![tst-reflect](https://img.shields.io/npm/v/tst-reflect.svg?color=brightgreen&style=flat-square&logo=npm&label=tst-reflect)](https://www.npmjs.com/package/tst-reflect)
[![tst-reflect-transformer](https://img.shields.io/npm/v/tst-reflect-transformer.svg?color=brightgreen&style=flat-square&logo=npm&label=tst-reflect-transformer)](https://www.npmjs.com/package/tst-reflect-transformer)
[![License MIT](https://img.shields.io/badge/License-MIT-brightgreen?style=flat-square)](https://opensource.org/licenses/MIT)

This is TypeScript transformer generating Type objects that are working at runtime, providing metadata about types such as list of properties and their types, list of constructors
and their parameters and their types and much more.

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
inferType(variable); // "number"; thanks to @reflect generic, you don't have to pass generic param, but it is not recomended.
```

More in [README](https://github.com/Hookyns/ts-reflection) in root repository folder.

## How to start

`npm i tst-reflect && npm i tst-reflect-transformer -D`

In order to use transformer plugin you will need TypeScript compiler which support plugins (if you don't want to write custom compiler via TypeScript API on your own), eg.
package [ttypescript](https://www.npmjs.com/package/ttypescript).

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
	props: [{n: "foo", t: getType({n: "string", k: 2})}, {n: "bar", t: getType({k: 3, types: [getType({k: 6, v: "a"}), getType({k: 6, v: "b"})], union: true, inter: false})}]
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

Property `metadata: false | string` allows you to switch behavior. Default behavior generates metadata library file. You can change name and/or location of this file by setting own
path. Or you can set `false` to disable generation of that file; metadata will be separated in files where they are used. Metadata can be redundant if same types are used in more
files.

## Examples

### Advanced Example

This example shows super simple dependency injection using reflection and generics.

> index.ts

```typescript
import {getType, Type}     from "tst-reflect";
import {IService, Service} from "./dependency";

class ServiceCollection
{
	public readonly services: Array<[Type, any]> = [];

	addTransient<TDep, TImp = any>(dependencyType?: Type, dependencyImplementation?: Type | any)
	{
		this.services.push([dependencyType ?? getType<TDep>(), dependencyImplementation ?? getType<TImp>()]);
	}
}

class ServiceProvider
{
	private serviceCollection: ServiceCollection;

	constructor(serviceCollection: ServiceCollection)
	{
		this.serviceCollection = serviceCollection;
	}

	getService<TDependency>(type?: Type): TDependency
	{
		type ??= getType<TDependency>();

		const arr = this.serviceCollection.services.find(([dep]) => dep.is(type));
		const impl = arr[1];

		if (!impl)
		{
			throw new Error(`No implementation registered for '${type.name}'`);
		}

		if (impl instanceof Type)
		{
			return Reflect.construct(impl.ctor, []);
		}

		return impl;
	}

	getServiceGenericOnly<TDependency>(): TDependency
	{
		return this.getService(getType<TDependency>());
	}
}

const serviceCollection = new ServiceCollection();
serviceCollection.addTransient(getType<IService>(), getType<Service>());
// or with generic
serviceCollection.addTransient<IService, Service>();

const serviceProvider = new ServiceProvider(serviceCollection);

const s1 = serviceProvider.getService<IService>();
console.log("Type created using reflection: ", s1);
console.log("s1 is instanceof Service: ", s1 instanceof Service); // true

const s2 = serviceProvider.getServiceGenericOnly<IService>();
console.log("Type created using generic reflection: ", s2);

```

Generated output

```javascript
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tst_reflect_1 = require("tst-reflect");
const dependency_1 = require("./dependency");
tst_reflect_1.getType({ n: "IService", fn: "..\\dependency.ts:IService", props: [{ n: "prop", t: tst_reflect_1.getType({ k: 3, types: [tst_reflect_1.getType({ n: "string", k: 2 }), tst_reflect_1.getType({ n: "number", k: 2 })], union: true, inter: false }) }], k: 0 }, 22978);
tst_reflect_1.getType({ n: "ILogger", fn: "..\\dependency.ts:ILogger", k: 0 }, 22976);
tst_reflect_1.getType({ n: "Service", fn: "..\\dependency.ts:Service", props: [{ n: "prop", t: tst_reflect_1.getType({ k: 3, types: [tst_reflect_1.getType({ n: "string", k: 2 }), tst_reflect_1.getType({ n: "number", k: 2 })], union: true, inter: false }) }, { n: "logger", t: tst_reflect_1.getType(22976), d: [{ n: "inject" }] }, { n: "Logger", t: tst_reflect_1.getType(22976) }], ctors: [{ params: [{ n: "logger", t: tst_reflect_1.getType(22976) }] }], decs: [{ n: "injectable" }], k: 1, ctor: () => dependency_1.Service, iface: tst_reflect_1.getType(22978) }, 22980);
class ServiceCollection {
	constructor() {
		this.services = [];
	}
	addTransient(dependencyType, dependencyImplementation, __genericParams__) {
		this.services.push([dependencyType ?? __genericParams__.TDep, dependencyImplementation ?? __genericParams__.TImp]);
	}
}
class ServiceProvider {
	constructor(serviceCollection) {
		this.serviceCollection = serviceCollection;
	}
	getService(type, __genericParams__) {
		type ?? (type = __genericParams__.TDependency);
		const arr = this.serviceCollection.services.find(([dep]) => dep.is(type));
		const impl = arr[1];
		if (!impl) {
			throw new Error(`No implementation registered for '${type.name}'`);
		}
		if (impl instanceof tst_reflect_1.Type) {
			return Reflect.construct(impl.ctor, []);
		}
		return impl;
	}
	getServiceGenericOnly(__genericParams__) {
		return this.getService(__genericParams__.TDependency);
	}
}
const serviceCollection = new ServiceCollection();
serviceCollection.addTransient(tst_reflect_1.getType(22978), tst_reflect_1.getType(22980));
serviceCollection.addTransient(undefined, undefined, { TDep: tst_reflect_1.getType(22978), TImp: tst_reflect_1.getType(22980) });
const serviceProvider = new ServiceProvider(serviceCollection);
const s1 = serviceProvider.getService(undefined, { TDependency: tst_reflect_1.getType(22978) });
console.log("Type created using reflection: ", s1);
console.log("s1 is instanceof Service: ", s1 instanceof dependency_1.Service);
const s2 = serviceProvider.getServiceGenericOnly({ TDependency: tst_reflect_1.getType(22978) });
console.log("Type created using generic reflection: ", s2);
//# sourceMappingURL=example2-simple.js.map
```

## License

This project is licensed under the MIT license.