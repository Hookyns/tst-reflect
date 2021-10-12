import { TypeKind }              from "tst-reflect/reflect";
import * as ts                   from "typescript";
import { TypeFlags }             from "typescript";
import { Context }               from "./contexts/Context";
import { TypeDescriptionResult } from "./declarations";
import getTypeCall               from "./getTypeCall";

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
					args: [getTypeCall(typeArguments[0], undefined, context)]
				}
			};
		}
	}

	return {
		ok: false
	};
}