import {
	GET_TYPE_FNC_NAME,
	REFLECTED_TYPE_ID,
	TYPE_ID_PROPERTY_NAME
}                                       from "tst-reflect";
import * as ts                          from "typescript";
import { Context }                      from "../contexts/Context";
import {
	getType,
	hasReflectJsDoc,
	isNodeIgnored
}                                       from "../helpers";
import { log }                          from "../log";
import { processDecorator }             from "../transformers/processDecorator";
import { processGenericCallExpression } from "../transformers/processGenericCallExpression";
import { processGetTypeCallExpression } from "../transformers/processGetTypeCallExpression";
import DeclarationVisitor               from "./declarationVisitor";

/**
 * Main visitor, splitting visitation into specific parts
 * @param nodeToVisit
 * @param context
 */
export function mainVisitor(nodeToVisit: ts.Node, context: Context): ts.VisitResult<ts.Node>
{
	if ((ts.isMethodDeclaration(nodeToVisit) || ts.isFunctionDeclaration(nodeToVisit)))
	{
		const visitedDeclaration = DeclarationVisitor.instance.visitDeclaration(nodeToVisit, context);

		if (visitedDeclaration === undefined)
		{
			return nodeToVisit;
		}

		nodeToVisit = visitedDeclaration;
	}

	const node = nodeToVisit;

	// Is it call expression? But not decorator! Decorators are handled in separated block.
	if (ts.isCallExpression(node) && (!node.parent || !ts.isDecorator(node.parent)))
	{
		// If it's already processed and re-generated call node, do not visit it.
		// If it is generated, it has no position -> -1.
		if (isNodeIgnored(node))
		{
			return node;
		}

		// GETTYPE<TType>()
		// Is it call of some function named "getType"?
		if (ts.isIdentifier(node.expression) && node.expression.escapedText == GET_TYPE_FNC_NAME)
		{
			// Function/method type
			const fncType = context.typeChecker.getTypeAtLocation(node.expression);

			// Check if it's our getType<T>() by checking it has our special static property.
			if (fncType.getProperty(TYPE_ID_PROPERTY_NAME))
			{
				const res = processGetTypeCallExpression(context, node);

				if (res)
				{
					return res;
				}
			}
		}
			// SOMETHING<TType>()
		// It is call of some other function
		else
		{
			let identifier: ts.Identifier | ts.PrivateIdentifier | undefined = undefined;

			if (ts.isIdentifier(node.expression))
			{
				identifier = node.expression;
			}
			else if (ts.isPropertyAccessExpression(node.expression)) // TODO: Test it. It may be property access of property access.
			{
				identifier = node.expression.name;
			}

			if (identifier !== undefined)
			{
				const type = context.typeChecker.getTypeAtLocation(identifier);

				// If call expression has typeArguments OR declaration of called function/method has type parameters.
				// Later there is check if the declaration has the @reflect JSDoc comment.
				if (node.typeArguments?.length || (type.getSymbol()?.valueDeclaration as ts.FunctionLikeDeclaration | undefined)?.typeParameters?.length)
				{
					const res = processGenericCallExpression(context, node, type);

					if (res)
					{
						return ts.visitEachChild(res, context.visitor, context.transformationContext);
					}
				}
				else if (context.config.debugMode)
				{
					log.info(`There is an callExpression '${identifier.escapedText}' but no declaration has been found.`);
				}
			}
		}
	}
	// DECORATOR usage - Assign Type's Id to its prototype
	else if (ts.isDecorator(node)
		&& (
			ts.isClassDeclaration(node.parent)
			|| ts.isPropertyDeclaration(node.parent)
			|| ts.isMethodDeclaration(node.parent)
			|| ts.isGetAccessorDeclaration(node.parent)
			|| ts.isSetAccessorDeclaration(node.parent)
		)
	)
	{
		// type of decorator
		let type: ts.Type | undefined = undefined;

		if (ts.isCallExpression(node.expression))
		{
			type = context.typeChecker.getTypeAtLocation(node.expression.expression);
		}
		else if (ts.isIdentifier(node.expression))
		{
			const symbol = context.typeChecker.getSymbolAtLocation(node.expression);

			if (symbol)
			{
				type = getType(symbol, context);
			}
		}

		if (type && hasReflectJsDoc(type.getSymbol()))
		{
			const res = processDecorator(node, type, context);

			if (res)
			{
				return ts.visitEachChild(res, context.visitor, context.transformationContext);
			}
		}
	}
	// CLASS Declaration - Assign Type's Id to its prototype
	else if (ts.isClassDeclaration(node))
	{
		const typeId = (context.typeChecker.getTypeAtLocation(node) as any).id;
		// const typeId = (context.typeChecker.getTypeAtLocation(node).symbol as any).id;

		if (typeId)
		{
			// Generate assignment of class's type ID to its prototype
			return [
				ts.visitEachChild(node, context.visitor, context.transformationContext),

				// EMIT: ClassIdentifier.prototype[REFLECTED_TYPE_ID] = typeId;
				ts.factory.createExpressionStatement(
					ts.factory.createBinaryExpression(
						ts.factory.createElementAccessExpression(
							ts.factory.createPropertyAccessExpression(
								node.name as ts.Expression,
								"prototype"
							),
							ts.factory.createStringLiteral(REFLECTED_TYPE_ID)
						),
						ts.factory.createToken(ts.SyntaxKind.EqualsToken),
						ts.factory.createNumericLiteral(typeId)
					)
				)
			];
		}
	}

	return ts.visitEachChild(node, context.visitor, context.transformationContext);
}
