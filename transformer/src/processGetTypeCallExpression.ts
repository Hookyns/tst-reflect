import * as ts          from "typescript";
import {Context}        from "./visitors/Context";
import {GENERIC_PARAMS} from "./helpers";
import getTypeCall      from "./getTypeCall";

export function processGetTypeCallExpression(node: ts.CallExpression, context: Context)
{
	// Add identifier into context; will be used for all calls
	if (!context.sourceFileContext.getTypeIdentifier)
	{
		context.sourceFileContext.getTypeIdentifier = node.expression as ts.Identifier;
	}

	let genericTypeNode = node.typeArguments?.[0];

	if (!genericTypeNode)
	{
		throw new Error("Type argument of function getType<T>() is missing.");
	}

	let genericType = context.checker.getTypeAtLocation(genericTypeNode);

	// Parameter is another generic type; replace by "__genericParam__.X", where X is name of generic parameter
	if (genericType.flags == ts.TypeFlags.TypeParameter)
	{
		if (ts.isTypeReferenceNode(genericTypeNode) && ts.isIdentifier(genericTypeNode.typeName))
		{
			return ts.factory.createPropertyAccessExpression(
				ts.factory.createIdentifier(GENERIC_PARAMS),
				ts.factory.createIdentifier(genericTypeNode.typeName.escapedText.toString())
			);
		}
	}
	// Parameter is specific type
	else
	{
		const genericTypeSymbol = genericType.getSymbol();

		if (!genericTypeSymbol)
		{
			throw new Error("Symbol of generic type argument not found.")
		}

		return getTypeCall(
			genericTypeSymbol,
			genericType,
			context.checker,
			context.sourceFileContext,
			ts.isTypeReferenceNode(genericTypeNode) ? genericTypeNode.typeName : undefined
		);
	}
}