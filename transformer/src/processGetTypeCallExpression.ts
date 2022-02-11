import * as ts            from "typescript";
import { Context }        from "./contexts/Context";
import { getError }       from "./getError";
import { getTypeCall }    from "./getTypeCall";
import { GENERIC_PARAMS } from "./helpers";
import { log }            from "./log";

export function processGetTypeCallExpression(
	node: ts.CallExpression,
	context: Context
): ts.PropertyAccessExpression | ts.CallExpression | ts.ParenthesizedExpression | undefined
{
	// TODO: Use isGetTypeCall()

	let genericTypeNode = node.typeArguments?.[0];

	if (!genericTypeNode)
	{
		// Calls like "getType(variable)" allowed. It returns runtime value.
		return undefined;
		// throw getError(node, "Type argument 'TType' of function getType<TType>() is missing.");
	}

	let genericType = context.typeChecker.getTypeAtLocation(genericTypeNode);

	// Parameter is another generic type; replace by "__genericParam__.X", where X is name of generic parameter
	if (genericType.flags == ts.TypeFlags.TypeParameter)
	{
		if (ts.isTypeReferenceNode(genericTypeNode) && ts.isIdentifier(genericTypeNode.typeName))
		{
			return ts.factory.createParenthesizedExpression(
				ts.factory.createBinaryExpression(
					ts.factory.createIdentifier(GENERIC_PARAMS),
					ts.SyntaxKind.AmpersandAmpersandToken,
					ts.factory.createPropertyAccessExpression(
						ts.factory.createIdentifier(GENERIC_PARAMS),
						ts.factory.createIdentifier(genericTypeNode.typeName.escapedText.toString())
					)
				)
			);
		}

		return undefined;
	}
	// Parameter is specific type
	else
	{
		const genericTypeSymbol = genericType.getSymbol();

		if (!genericTypeSymbol)
		{
			log.warn(node, "Symbol of generic type argument not found.");
			// throw getError(node, "Symbol of generic type argument not found.");
		}

		return context.metaWriter.factory.updateSourceFileGetTypeCall(
			getTypeCall(
				genericType,
				genericTypeSymbol,
				context,
				ts.isTypeReferenceNode(genericTypeNode) ? genericTypeNode.typeName : undefined
			),
		);
	}
}
