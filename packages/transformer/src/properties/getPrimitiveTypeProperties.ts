import { TypeKind }             from "@rtti/abstract";
import * as ts                  from "typescript";
import { NativeTypeProperties } from "../declarations";
import { Context }              from "../contexts/Context";


/**
 * Return TypeProperties whether the type is a primitive native type.
 * @param context
 * @param typeNode
 * @param type
 */
export function getPrimitiveTypeProperties(context: Context, typeNode: ts.TypeNode, type?: ts.Type): NativeTypeProperties | undefined
{
	type ??= context.typeChecker.getTypeAtLocation(typeNode);
	return PrimitiveTypesMap[type.flags];

	// if (mappedTypeProperties !== undefined)
	// {
	// 	return mappedTypeProperties;
	// }

	// if (isArrayType(type))
	// {
	// 	const typeArguments = context.typeChecker.getTypeArguments(type as ts.TypeReference);
	//
	// 	if (typeArguments.length == 1)
	// 	{
	// 		return {
	// 			n: "Array",
	// 			k: TypeKind.Array, // TODO: Review array
	// 			ctor: getNativeTypeCtor("Array"), // TODO: Assign ctor in runtime by TypeKind
	// 			args: [getTypeCall(typeArguments[0], undefined, context)]
	// 		};
	// 	}
	// }
	//
	// return undefined;
}

// /**
//  * Questioning if this could be better/is pointless
//  *
//  * @param {string} name
//  * @returns {string}
//  */
// function getNativeTypeCtorName(name: string): string | undefined
// {
// 	if (!name)
// 	{
// 		return undefined;
// 	}
//
// 	switch (name.toLowerCase())
// 	{
// 		case "bigint":
// 			return "BigInt";
// 		case "symbol":
// 			return "Symbol";
// 		case "string":
// 			return "String";
// 		case "number":
// 			return "Number";
// 		case "boolean":
// 			return "Boolean";
// 		case "array":
// 			return "Array";
// 	}
//
// 	return undefined;
// }
//
// function getNativeTypeCtor(name: string): ts.FunctionExpression | undefined
// {
// 	const nativeCtorType = getNativeTypeCtorName(name);
// 	if (nativeCtorType === undefined)
// 	{
// 		return undefined;
// 	}
//
// 	// EMIT: function() { return Promise.resolve($nativeCtorType) }
// 	return ts.factory.createFunctionExpression(
// 		undefined,
// 		undefined,
// 		undefined,
// 		undefined,
// 		[],
// 		undefined,
// 		ts.factory.createBlock([
// 			ts.factory.createReturnStatement(
// 				ts.factory.createCallExpression(
// 					ts.factory.createPropertyAccessExpression(
// 						ts.factory.createIdentifier("Promise"),
// 						ts.factory.createIdentifier("resolve")
// 					),
// 					undefined,
// 					[
// 						ts.factory.createIdentifier(nativeCtorType)
// 					]
// 				)
// 			)
// 		], true)
// 	);
// }

const PrimitiveTypesMap: { [flag: number]: NativeTypeProperties } = {
	[ts.TypeFlags.String]: { kind: TypeKind.String },
	[ts.TypeFlags.Number]: { kind: TypeKind.Number },
	[ts.TypeFlags.Boolean]: { kind: TypeKind.Boolean },
	[ts.TypeFlags.BigInt]: { kind: TypeKind.BigInt },
	[ts.TypeFlags.ESSymbol]: { kind: TypeKind.Symbol },
	[ts.TypeFlags.Any]: { kind: TypeKind.Any },
	[ts.TypeFlags.Unknown]: { kind: TypeKind.Unknown },
	[ts.TypeFlags.Never]: { kind: TypeKind.Never },
	[ts.TypeFlags.Undefined]: { kind: TypeKind.Undefined },
	[ts.TypeFlags.Null]: { kind: TypeKind.Null },
	[ts.TypeFlags.Void]: { kind: TypeKind.Void },
};
