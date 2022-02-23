import {
	Metadata,
	Type
} from "@rtti/abstract";
import { REFLECTED_TYPE_ID }        from "./consts";
import { ExtendedTypeBuilder }      from "./type-builder/ExtendedTypeBuilder";
import { ObjectLiteralTypeBuilder } from "./type-builder/ObjectLiteralTypeBuilder";

const ArrayItemsCountToCheckItsType = 10;

/**
 * @param value
 * @internal
 */
export function getTypeOfRuntimeValue(value: any): Type
{
	if (value === undefined) return Type.Undefined;
	if (value === null) return Type.Null;
	if (typeof value === "string") return Type.String;
	if (typeof value === "number") return Type.Number;
	if (typeof value === "boolean") return Type.Boolean;
	if (typeof value === "symbol") return Type.Symbol;
	if (value instanceof Date) return Type.Date;
	if (value.constructor === Object) return ObjectLiteralTypeBuilder.fromObject(value);

	if (!value.constructor)
	{
		return Type.Unknown;
	}

	if (value.constructor == Array)
	{
		const set = new Set<Type>();

		// If it is an array, there can be anything; we'll check first X cuz of performance.
		for (let item of value.slice(0, ArrayItemsCountToCheckItsType))
		{
			set.add(getTypeOfRuntimeValue(item));
		}

		const valuesTypes = Array.from(set);
		const arrayBuilder = ExtendedTypeBuilder.createArray();

		if (value.length == 0)
		{
			return arrayBuilder
				.setGenericType(Type.Any)
				.build();
		}

		const unionBuilder = ExtendedTypeBuilder.createUnion(valuesTypes);

		// If there are more items than we checked, add Unknown type to the union.
		if (value.length > ArrayItemsCountToCheckItsType)
		{
			unionBuilder.addTypes(Type.Unknown);
		}

		return arrayBuilder.setGenericType(unionBuilder.build()).build();
	}

	return Metadata.resolveType(value.constructor.prototype[REFLECTED_TYPE_ID]) || Type.Unknown
}

/**
 * Returns Type of value in memory.
 * @description Returns
 * @param value
 */
export function getType(value: any): Type
/**
 * Returns Type of generic parameter.
 */
export function getType<T>(): Type
export function getType<T>(...args: any[]): Type
{
	if (args.length)
	{
		return getTypeOfRuntimeValue(args[0]);
	}

	if (!(((typeof window === "object" && window) || (typeof global === "object" && global) || globalThis) as any)["tst-reflect-disable"])
	{
		console.debug("[ERR] tst-reflect: You call getType() method directly. " +
			"You have probably wrong configuration, because tst-reflect-transformer package should replace this call by the Type instance.\n" +
			"If you have right configuration it may be BUG so try to create an issue.\n" +
			"If it is not an issue and you don't want to see this debug message, " +
			"create field 'tst-reflect-disable' in global object (window | global | globalThis) eg. `window['tst-reflect-disable'] = true;`");
	}

	// In case of direct call, we'll return Unknown type.
	return Type.Unknown;
}

/** @internal */
getType.__tst_reflect__ = true;

/**
 * Class decorator which marks classes to be processed and included in metadata lib file.
 * @reflect
 */
export function reflect<TType>()
{
	return function <T>(Constructor: { new(...args: any[]): T }) {
		return Constructor;
	};
}

/** @internal */
reflect.__tst_reflect__ = true;


// function createNativeType(typeName: string, kind: TypeKind, ctor?: Function): Type
// {
// 	const type = Reflect.construct(Type, [], TypeActivator);
//
// 	type.initialize({
// 		n: typeName,
// 		fn: typeName,
// 		ctor: () => ctor,
// 		k: kind
// 	});
//
// 	return type;
// }

// /**
//  * List of native types
//  * @description It should save some memory and all native Types will be the same instances.
//  */
// const nativeTypes = {
// 	"Object": createNativeType("Object", TypeKind.Object, Object),
// 	"Unknown": createNativeType("unknown", TypeKind.Unknown),
// 	"Any": createNativeType("any", TypeKind.Any),
// 	"Void": createNativeType("void", TypeKind.Void),
// 	"String": createNativeType("string", TypeKind.String, String),
// 	"Number": createNativeType("Number", TypeKind.Number, Number),
// 	"Boolean": createNativeType("Boolean", TypeKind.Boolean, Boolean),
// 	"Date": createNativeType("Date", TypeKind.Date, Date),
// 	"Null": createNativeType("null", TypeKind.Null),
// 	"Undefined": createNativeType("undefined", TypeKind.Undefined),
// 	"Never": createNativeType("never", TypeKind.Never),
// 	"BigInt": createNativeType("BigInt", TypeKind.BigInt, BigInt),
// 	"Symbol": createNativeType("Symbol", TypeKind.Symbol, Symbol),
// 	"RegExp": createNativeType("RegExp", TypeKind.RegExp, RegExp),
// 	"Int8Array": createNativeType("Int8Array", TypeKind.Int8Array, Int8Array),
// 	"Uint8Array": createNativeType("Uint8Array", TypeKind.Uint8Array, Uint8Array),
// 	"Uint8ClampedArray": createNativeType("Uint8ClampedArray", TypeKind.Uint8ClampedArray, Uint8ClampedArray),
// 	"Int16Array": createNativeType("Int16Array", TypeKind.Int16Array, Int16Array),
// 	"Uint16Array": createNativeType("Uint16Array", TypeKind.Uint16Array, Uint16Array),
// 	"Int32Array": createNativeType("Int32Array", TypeKind.Int32Array, Int32Array),
// 	"Uint32Array": createNativeType("Uint32Array", TypeKind.Uint32Array, Uint32Array),
// 	"Float32Array": createNativeType("Float32Array", TypeKind.Float32Array, Float32Array),
// 	"Float64Array": createNativeType("Float64Array", TypeKind.Float64Array, Float64Array),
// 	"BigInt64Array": createNativeType("BigInt64Array", TypeKind.BigInt64Array, BigInt64Array),
// 	"BigUint64Array": createNativeType("BigUint64Array", TypeKind.BigUint64Array, BigUint64Array),
// };

// /**
//  * @internal
//  */
// export const NativeTypes = new Map<string, Type>();
//
// for (let entry of Object.entries(nativeTypes))
// {
// 	NativeTypes.set(entry[0].toLowerCase(), entry[1]);
// }
//
// for (const typeName in nativeTypes)
// {
// 	if (nativeTypes.hasOwnProperty(typeName))
// 	{
// 		(Type as any)[typeName] = (nativeTypes as any)[typeName];
// 	}
// }