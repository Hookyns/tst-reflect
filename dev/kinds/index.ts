import {
	Type,
	TypeKind
}                  from "@rtti/abstract";
import { getType } from "tst-reflect";

getType<{ foo: string, bar: number }>();

interface ISomething
{
	property: string;
	optionalProperty?: string;
	readonly readOnlyProperty: string;

	get getter(): string;

	set setter(val: string);

	method(): string;

	optionalMethod?(): string;
}

// Interface
getType<ISomething>();

function decorator(target: any)
{
}

@decorator
class Something implements ISomething
{
	property: string;
	optionalProperty?: string;
	readonly readOnlyProperty: string;

	get getter(): string
	{
		return "";
	}

	set setter(val: string)
	{
	}

	method(): string
	{
		return "";
	}

	optionalMethod?(): string;
}

// CLass
getType<Something>();

// TransientTypeReference
getType<Readonly<{ foo: string }>>();
getType<Partial<{ foo: string }>>();

// Tuple
getType<[named: string, tuple: string]>();
getType<[string, number]>();

// TypeParameter
class GenericType<T>
{
	foo: T;
}

getType<GenericType<string>>(); // Class will have the TypeParameter

// ConditionalType
interface ConditionalType
{
	method<T>(): T extends string ? never : number;
}

getType<ConditionalType>(); // Method has ConditionalType return type

// IndexedAccess
interface IndexedAccess
{
	method<K extends keyof TypeKind>(key: K): TypeKind[K];
}

getType<IndexedAccess>();

// Module
module Mod
{
	export function foo()
	{
	}
}
namespace Ns
{
	function foo()
	{
	}
}
getType<typeof Mod>();
getType<typeof Ns>();

// Union
getType<string | number>();

// Intersection
console.log("intersection");
getType<{ foo: string } & { foo: string, bar: number }>();

// Method
getType<IndexedAccess["method"]>();

// Function
const fn = function (a: any) {
};
getType<typeof fn>();

// GeneratorFunction
const genFn = function* (a: any) {
};
getType<typeof genFn>();

// Enum
enum Enm
{
	One, Two
}

getType<Enm>();

// Enum literal
getType<Enm.One>();

getType<any>();
getType<unknown>();
getType<undefined>();
getType<null>();
getType<void>();

getType<string>();
getType<number>();
getType<BigInt>();
getType<Boolean>();
getType<Date>();

getType<Array<number>>();
getType<number[]>();

getType<Map<string, string>>();
getType<WeakMap<Function, string>>();
getType<Set<string>>();
getType<WeakSet<Function>>();

getType<Int8Array>();
getType<Uint8Array>();
getType<Uint8ClampedArray>();
getType<Int16Array>();
getType<Uint16Array>();
getType<Int32Array>();
getType<Uint32Array>();
getType<Float32Array>();
getType<Float64Array>();
getType<BigInt64Array>();
getType<BigUint64Array>();

getType<Symbol>();
getType<Promise<boolean>>();
getType<Error>();
getType<RegExp>();

getType<ArrayBuffer>();
getType<SharedArrayBuffer>();
getType<Atomics>();
getType<DataView>();
getType<Generator>();

// Proxy TODO: Probably will not work, typeof proxy object is type of that object, proxy is not a type
const proxy = new Proxy({}, {});
getType<typeof proxy>();

const regexLiteral = /[a-b]/;
getType<typeof regexLiteral>();

getType<5>();
getType<"string">();
getType<true>();
const bigint = BigInt(5);
getType<typeof bigint>();
getType<`Some bigint ${bigint} here`>();
