import * as ts          from "typescript";
import {Context}        from "./visitors/Context";
import {GENERIC_PARAMS} from "./helpers";
import getTypeCall      from "./getTypeCall";
import {getError}       from "./getError";

export function processGetTypeCallExpression(node: ts.CallExpression, context: Context)
{
	// TODO: Use isGetTypeCall()
	
	// Add identifier into context; will be used for all calls
	if (!context.sourceFileContext.getTypeIdentifier)
	{
		context.sourceFileContext.getTypeIdentifier = node.expression as ts.Identifier;
	}

	let genericTypeNode = node.typeArguments?.[0];

	if (!genericTypeNode)
	{
		throw getError(node, "Type argument of function getType<T>() is missing.");
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
			throw getError(node, "Symbol of generic type argument not found.")
		}

		return getTypeCall(
			genericType,
			genericTypeSymbol,
			context.checker,
			context.sourceFileContext,
			ts.isTypeReferenceNode(genericTypeNode) ? genericTypeNode.typeName : undefined
		);
	}
}