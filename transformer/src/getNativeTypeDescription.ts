import { TypeKind }              from "tst-reflect";
import * as ts                   from "typescript";
import { TypeFlags }             from "typescript";
import { Context }               from "./contexts/Context";
import { TypeDescriptionResult } from "./declarations";
import { getTypeCall }           from "./getTypeCall";

/**
 * Questioning if this could be better/is pointless
 *
 * @param {string} name
 * @returns {string}
 */
function getNativeTypeCtorName(name: string): string | undefined
{
	if (!name)
	{
		return undefined;
	}

	switch (name.toLowerCase())
	{
		case "bigint":
			return "BigInt";
		case "symbol":
			return "Symbol";
		case "string":
			return "String";
		case "number":
			return "Number";
		case "boolean":
			return "Boolean";
		case "array":
			return "Array";
	}

	return undefined;
}

function getNativeTypeCtor(name: string): ts.FunctionExpression | undefined
{
	const nativeCtorType = getNativeTypeCtorName(name);
	if (nativeCtorType === undefined)
	{
		return undefined;
	}
	return ts.factory.createFunctionExpression(
		undefined,
		undefined,
		undefined,
		undefined,
		[],
		undefined,
		ts.factory.createBlock([
			ts.factory.createReturnStatement(
				ts.factory.createIdentifier(nativeCtorType)
			)
		], false)
	);
}

/**
 * Check that Type is native type (string, number, boolean, ...)
 * @param type
 * @param context
 */
export function getNativeTypeDescription(type: ts.Type, context: Context): TypeDescriptionResult
{
	if ((type as any)["intrinsicName"] !== undefined)
	{
		return {
			ok: true,
			typeDescription: {
				n: (type as any).intrinsicName,
				k: TypeKind.Native,
				ctor: getNativeTypeCtor((type as any).intrinsicName),
				ctors: undefined,
				decs: undefined,
				props: undefined
			}
		};
	}

	// [Hookyns] Check if type is Array. I found no direct way to do so.
	if ((type.flags & TypeFlags.Object) == TypeFlags.Object && type.getSymbol()?.escapedName == "Array")
	{
		const typeArguments = context.typeChecker.getTypeArguments(type as ts.TypeReference);

		if (typeArguments.length == 1)
		{
			return {
				ok: true,
				typeDescription: {
					n: "Array",
					k: TypeKind.Native,
					ctor: getNativeTypeCtor("Array"),
					args: [getTypeCall(typeArguments[0], undefined, context)]
				}
			};
		}
	}

	return {
		ok: false
	};
}
