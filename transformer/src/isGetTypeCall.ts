import * as ts                 from "typescript";
import {TYPE_ID_PROPERTY_NAME} from "tst-reflect";
import {Context}               from "./visitors/Context";
import {getError}              from "./getError";

/**
 * Function detecting right getType() call
 * @param node
 * @param context
 * @returns false: node is not getTypeCall and visitation of childs should process | NodeType: it is getTypeCall and this is type of generic argument | undefined: stop visitation, it's call expression but not getType<T>()
 */
export function isGetTypeCall(node: ts.Node, context: Context): false | ts.TypeNode
{
	if (ts.isCallExpression(node))
	{
		// Return if it's not getType()
		if ((node.expression as any).escapedText != "getType")
		{
			return false;
		}

		// Add identifier into context; will be used for all calls
		if (!context.sourceFileContext.getTypeIdentifier)
		{
			context.sourceFileContext.getTypeIdentifier = node.expression as ts.Identifier;
		}

		// Function/method type
		const fncType = context.checker.getTypeAtLocation(node.expression);

		// Check if it's our getType()
		if (!fncType.getProperty(TYPE_ID_PROPERTY_NAME))
		{
			return false;
		}

		let genericTypeNode: ts.TypeNode | undefined = node.typeArguments?.[0];

		if (!genericTypeNode)
		{
			throw getError(node, "Type argument of function getType<T>() is missing.");
		}

		return genericTypeNode;
	}

	return false;
}