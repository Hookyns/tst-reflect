import * as ts                                    from "typescript";
import {Context}                                  from "./visitors/Context";
import {State, STATE_PROP, StateNode}             from "./visitors/State";
import {genericCalleeDeclarationExploringVisitor} from "./visitors/genericCalleeDeclarationExploringVisitor";
import getTypeCall                                from "./getTypeCall";

export function processGenericCallExpression(node: ts.CallExpression, context: Context): ts.CallExpression | undefined
{
	// Function/method type
	const fncType = context.checker.getTypeAtLocation(node.expression);

	// Method/function declaration
	const declaration = fncType.symbol.declarations[0] as ts.FunctionLikeDeclarationBase;

	// Try to get State
	let state: State | undefined = (declaration as unknown as StateNode)[STATE_PROP];

	if (!state)
	{
		state = genericCalleeDeclarationExploringVisitor(declaration, context)
	}

	if (state && state.usedGenericParameters && state.indexesOfGenericParameters)
	{
		const args: Array<ts.PropertyAssignment> = [];
		let i = 0;

		for (let genericParamName of state.usedGenericParameters)
		{
			const genericTypeNode = node.typeArguments![state.indexesOfGenericParameters[i]];
			let typePropertyVal: ts.Expression;

			if (genericTypeNode)
			{
				const genericType = context.checker.getTypeAtLocation(genericTypeNode);
				const genericTypeSymbol = genericType.getSymbol();
				typePropertyVal = getTypeCall(
					genericTypeSymbol,
					genericType,
					context.checker,
					context.sourceFileContext,
					ts.isTypeReferenceNode(genericTypeNode) ? genericTypeNode.typeName : undefined
				);
			}
			else
			{
				typePropertyVal = ts.factory.createIdentifier("undefined");
			}

			args.push(
				ts.factory.createPropertyAssignment(
					genericParamName,
					typePropertyVal
				)
			);

			i++;
		}

		const callArgs = [...node.arguments];

		if (callArgs.length < state.declaredParametersCount!)
		{
			for (let i = state.declaredParametersCount! - callArgs.length; i > 0; --i)
			{
				callArgs.push(ts.factory.createIdentifier("undefined"));
			}
		}

		return ts.factory.updateCallExpression(
			node,
			node.expression,
			node.typeArguments,
			[
				...callArgs,
				ts.factory.createObjectLiteralExpression(args)
			]
		);
	}
}