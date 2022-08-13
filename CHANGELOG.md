# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


[//]: # (## [1.0.0] - 2022-01-01)
[//]: # (### Added)
[//]: # (### Changed)

## [0.10.1] - 2022-08-13 - transformer
### Added
- Type.isGenericType(): boolean;
- Type.genericTypeDefinition: Type | undefined;

### Changed
- Each "instance" of a generic type is unique type with same genericTypeDefinition. 
\
Eg. lets have an `interface Ifce<T> {}`. `getType<IFce<string>>()` if different type than `getType<IFce<number>>()`. 
\
Property `genericTypeDefinition` of both types returns the same type `IFce<T>`, which is the definition of the generic type. This type is generic type too.
- Support of ES modules and the NodeNext option.

## [0.9.10] - 2022-06-21
### Added
- Generic type forwarding.
```typescript
	function foo<X>()
	{
		bar<X>(); // forward the type
		
		const type = getType<X>();
		doSomethingWithTypeHere(type);
	}

	function bar<Y>()
	{
		baz<Y>(); // forward the type
	}

	function baz<Z>()
	{
		const type = getType<Z>();
	}

	class A
	{
	}

	foo<A>();
```
### Changed
- Fix of recursive ("lazy") types,
- small fixes and PRs.

## [0.9.4] - 2022-03-07 - transformer
### Added
### Changed
- Ids of types are generated from ts.Type, not from ts.Symbol anymore.


## [0.7.4] - 2022-03-02
### Added
- `Type.isPromise()`
- `Type.isTuple()` - but it is not implemented by the transformer yet.
### Changed


## [0.9.3] - 2022-02-17 - transformer
### Added
- `examples/di`,

### Changed
- Enhanced generic types
  - now it is possible to infer type from passed argument, no need to specify type argument, eg:

<dl><dd><dl><dd>

```typescript
function getTypeName<T extends string | number>(arg: T): string
{
	return getType<T>().name;
}

getTypeName("Lorem ipsum dolor sit amet"); // > "string"
 ```
 
</dd></dl></dd></dl>
<ul>
<ul>
<li>function/method argument can be <code>arg: T</code>, <code>arg: T[]</code> or <code>...args: T[]</code>.
Other arguments eg. <code>arg: T | boolean</code> are resolved to <code>Type.Unknown</code>. There is still room for improvement. BTW you can still get type of passed value <code>getType(arg)</code>.</li>
<li>fixed issues with `arguments` and `Function.length.</li>
</ul>
</ul>

  - Fixed some troubles with generated metadata,
  - small performance optimizations,
  - modified way of getting types' ids,
  - NOTE: git repository renamed to `tst-reflect`


## [0.7.3] - 2022-02-14
### Added
### Changed
- Fixed issue throwing Error about calling `getType()` without generic argument from transpilation.


## [0.7.2] - 2022-02-14
### Added
- New tests (#28) - coverage ~88 %.

### Changed
- Changed way of handling types of runtime value.
\
Now there is `SomeClass.prototype[REFLECTED_TYPE_ID] = ID of SomeClass's type;` generated for each class in the project (not just those decorated via `@reflect`).
It does not mean that metadata of those classes will be generated.
Logic of generating type's metadata is still the same, 
use `getType<SomeClass>()` somewhere, apply `@reflect` decorator 
or apply any other decorator tagged by `@reflect` JSDoc tag.
\
This is preparation for include/exclude configuration (issue #29).
- custom decorators tagged by `@reflect` JSDoc tag does not have to have generic parameter

## [0.7.1] - 2022-02-14
### Added
- `Type.isAny()`

### Changed
- `Type.isAssignableTo()` - added support of Arrays; fixed issue with optional members


## [0.7.0] - 2022-02-14
### Added
- `Type.toString()`

### Changed
- \[BREAKING] `Type.ctor: Function | undefined` changed to `Type.getCtor(): Promise<Function | undefined>`
\
Generated Promise is based on target module from tsconfig.
\
Generated code in case of ESM: `import("...path...").ExportedMember` otherwise: `Promise.resolve(require("...path...").ExportedMember)`.
\
Native types (String, Number, Object, etc..) are always generated as eg.: `Promise.resolve(Object)`
- Fixed `Method.optional`
- \[BREAKING] `Type.union` changed to `Type.isUnion()`
- \[BREAKING] `Type.intersection` changed to `Type.isIntersection()`
- Fixed of issue #23 - access to ctor of not exported class


## [0.7.0-alpha.0] - 2022-02-13
### Added
- `getType(val: any)` it is possible to get type of runtime value,

<dl>
<dd>

```typescript
const someValue: unknown = new Animal();
getType(someValue); // > Type<Animal>
```
This works mainly with classes.
Before #29 is implemented, `@reflect()` decorator, `@reflect` JSDoc tag or `getType<OfThatType>()` is required or there will be no Type metadata.

Native types such as Object `{ foo: "", bar: 5 }`, Array `[ {}, true, 5 ]` and primitive types are supported too; those types are recognized and their properties are parsed at runtime.

*Getters and setter of Objects are recognized.*
\
*Classes without metadata will be parsed as Objects.*

</dd>
</dl>

- `Decorator.getArguments(): Array<any>` - constant literal arguments of decorators are captured,
- `Type.isPrimitive()`,
- partial test coverage (~75%) - issue #28,
- `TypeBuilder`,
- decorator can be CallExpression`@decorator()` or (new) just Identifier `@decorator`
- implementation of #7 - custom Property and Method decorators supporting `getType<T>()` of generic parameters, like already supported class decorators.

### Changed
- JSDoc tags @reflectGeneric and @reflectDecorator removed in favor of single @reflect,
- `Property.decorators` changed to `Property.getDecorators()` - to keep it same as `Type.getDecorators()` and `Method.getDecorators()`,
- `Type.flattenInheritedMembers()` support base union and intersection types,
- fixed issue #27,
- fix of some circular dependencies in runtime package,
- few other small bug fixes.