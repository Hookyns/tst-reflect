import {
	GET_TYPE_FNC_NAME,
	TYPE_ID_PROPERTY_NAME
}                                       from "tst-reflect";
import * as ts                          from "typescript";
import { Context }                      from "../contexts/Context";
import { hasReflectJsDoc }              from "../helpers";
import { processGenericCallExpression } from "../processGenericCallExpression";
import { processGetTypeCallExpression } from "../processGetTypeCallExpression";
import DeclarationVisitor               from "./declarationVisitor";

/**
 * Main visitor, splitting visitation into specific parts
 * @param nodeToVisit
 * @param context
 */
export function mainVisitor<TNode extends ts.Node = ts.Node>(nodeToVisit: TNode, context: Context): TNode | ts.CallExpression | ts.PropertyAccessExpression | undefined
{
	const node = DeclarationVisitor.instance.visitDeclaration(nodeToVisit, context);

	if (node === undefined)
	{
		return nodeToVisit;
	}

	// Is it call expression?
	if (ts.isCallExpression(node))
	{
		// Is it call of some function named "getType"?
		if (ts.isIdentifier(node.expression) && node.expression.escapedText == GET_TYPE_FNC_NAME)
		{
			// If it's already processed and re-generated getType() call node, do not visit it.
			// If it is generated, it has no position -> -1.
			if (node.pos == -1)
			{
				return node;
			}

			// Function/method type
			const fncType = context.typeChecker.getTypeAtLocation(node.expression);

			// Check if it's our getType<T>() by checking it has our special static property.
			if (fncType.getProperty(TYPE_ID_PROPERTY_NAME))
			{
				const res = processGetTypeCallExpression(node, context);

				if (res)
				{
					return res;
				}
			}
		}
		// It is call of some other function, generic function or method, or it has our special JSDoc comment. (can be called on property access)
		else
		{
			const type = context.typeChecker.getTypeAtLocation(node.expression);

			if (node.typeArguments?.length || hasReflectJsDoc(type))
			{
				const res = processGenericCallExpression(node, type, context);

				if (res)
				{
					return ts.visitEachChild(res, context.visitor, context.transformationContext);
				}
			}
		}
	}

	return ts.visitEachChild(nodeToVisit, context.visitor, context.transformationContext);
}