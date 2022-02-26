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