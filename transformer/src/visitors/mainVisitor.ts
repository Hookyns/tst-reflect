import * as ts                        from "typescript";
import {TYPE_ID_PROPERTY_NAME}        from "tst-reflect";
import {getType}                      from "../helpers";
import {declarationVisitor}           from "./declarationVisitor";
import {Context}                      from "./Context";
import {processGenericCallExpression} from "../processGenericCallExpression";
import {processGetTypeCallExpression} from "../processGetTypeCallExpression";

/**
 * Main visitor, splitting visitation into specific parts
 * @param node
 * @param context
 */
export function mainVisitor(node: ts.Node, context: Context): ts.Node | undefined
{
	const declarationVisitResult = declarationVisitor(node, context)

	if (declarationVisitResult === undefined)
	{
		return node;
	}
	else
	{
		node = declarationVisitResult;
	}

	if (ts.isCallExpression(node))
	{
		// To speed up, check it is getType call
		if (ts.isIdentifier(node.expression) && node.expression.escapedText == "getType")
		{
			// Function/method type
			const fncType = context.checker.getTypeAtLocation(node.expression);

			// Check if it's our getType<T>()
			if (fncType.getProperty(TYPE_ID_PROPERTY_NAME))
			{
				const res = processGetTypeCallExpression(node, context);

				if (res)
				{
					return res;
				}
			}
		}
		// Call to something else, generic function or method; (can be call on property access)
		else if (node.typeArguments?.length)
		{
			const res = processGenericCallExpression(node, context);

			if (res)
			{
				return res;
			}
		}
	}

	return ts.visitEachChild(node, context.sourceFileContext.visitor, context.transformationContext);
}