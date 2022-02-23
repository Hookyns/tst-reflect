import { TypeKind }    from "@rtti/abstract";
import * as ts         from "typescript";
import { Context }     from "./contexts/Context";
import {
	TypePropertiesSource
}                      from "./declarations";
import { getTypeCall } from "./getTypeCall";
import { isArrayType } from "./helpers";

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

	// function() { return Promise.resolve($nativeCtorType) }
	return ts.factory.createFunctionExpression(
		undefined,
		undefined,
		undefined,
		undefined,
		[],
		undefined,
		ts.factory.createBlock([
			ts.factory.createReturnStatement(
				ts.factory.createCallExpression(
					ts.factory.createPropertyAccessExpression(
						ts.factory.createIdentifier("Promise"),
						ts.factory.createIdentifier("resolve")
					),
					undefined,
					[
						ts.factory.createIdentifier(nativeCtorType)
					]
				)
			)
		], true)
	);
}

const PrimitiveTypesMap: { [flag: number]: any } = {
	[ts.TypeFlags.String]: { k: TypeKind.String },
	[ts.TypeFlags.Number]: { k: TypeKind.Number },
	[ts.TypeFlags.Boolean]: { k: TypeKind.Boolean },
	[ts.TypeFlags.BigInt]: { k: TypeKind.BigInt },
	[ts.TypeFlags.ESSymbol]: { k: TypeKind.Symbol },
	[ts.TypeFlags.UniqueESSymbol]: { k: TypeKind.Symbol },
	[ts.TypeFlags.Any]: { k: TypeKind.Any },
	[ts.TypeFlags.Unknown]: { k: TypeKind.Unknown },
	[ts.TypeFlags.Never]: { k: TypeKind.Never },
	[ts.TypeFlags.Undefined]: { k: TypeKind.Undefined },
	[ts.TypeFlags.Null]: { k: TypeKind.Null },
	[ts.TypeFlags.Void]: { k: TypeKind.Void }
};

/**
 * Check that Type is native type (string, number, boolean, ...)
 * @param type
 * @param context
 */
export function getNativeTypeDescription(type: ts.Type, context: Context): TypePropertiesSource | undefined // TypeDescriptionResult TODO: Remove TypeDescriptionResult
{
	const mappedTypeProperties = PrimitiveTypesMap[type.flags];

	if (mappedTypeProperties !== undefined)
	{
		return mappedTypeProperties;
	}

	if (isArrayType(type))
	{
		const typeArguments = context.typeChecker.getTypeArguments(type as ts.TypeReference);

		if (typeArguments.length == 1)
		{
			return {
				n: "Array",
				k: TypeKind.Array, // TODO: Review array
				ctor: getNativeTypeCtor("Array"), // TODO: Assign ctor in runtime by TypeKind
				args: [getTypeCall(typeArguments[0], undefined, context)]
			};
		}
	}

	return undefined;
}
