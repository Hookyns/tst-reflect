import * as ts            from "typescript";
import { Context }        from "./contexts/Context";
import { GENERIC_PARAMS } from "./helpers";
import getTypeCall        from "./getTypeCall";
import { getError }       from "./getError";
import { log }            from "./log";

export function processGetTypeCallExpression(node: ts.CallExpression, context: Context): ts.PropertyAccessExpression | ts.CallExpression | ts.BinaryExpression | undefined
{
	// TODO: Use isGetTypeCall()

	// Add identifier into context; will be used for all calls
	if (context.trySetGetTypeIdentifier(node.expression as ts.Identifier) && context.config.debugMode)
	{
		log.info("Identifier of existing getType() call stored inside context.");
	}

	let genericTypeNode = node.typeArguments?.[0];

	if (!genericTypeNode)
	{
		// TODO: Allow calls like "getType(variable)"
		throw getError(node, "Type argument 'TType' of function getType<TType>() is missing.");
	}

	let genericType = context.typeChecker.getTypeAtLocation(genericTypeNode);

	// Parameter is another generic type; replace by "__genericParam__.X", where X is name of generic parameter
	if (genericType.flags == ts.TypeFlags.TypeParameter)
	{
		if (ts.isTypeReferenceNode(genericTypeNode) && ts.isIdentifier(genericTypeNode.typeName))
		{
			return ts.factory.createBinaryExpression(ts.factory.createIdentifier(GENERIC_PARAMS), ts.SyntaxKind.AmpersandAmpersandToken, ts.factory.createPropertyAccessExpression(
				ts.factory.createIdentifier(GENERIC_PARAMS),
				ts.factory.createIdentifier(genericTypeNode.typeName.escapedText.toString())
			));
		}

		return undefined;
	}
	// Parameter is specific type
	else
	{
		const genericTypeSymbol = genericType.getSymbol();

		if (!genericTypeSymbol)
		{
			throw getError(node, "Symbol of generic type argument not found.");
		}

		return getTypeCall(
			genericType,
			genericTypeSymbol,
			context,
			ts.isTypeReferenceNode(genericTypeNode) ? genericTypeNode.typeName : undefined
		);
	}
}