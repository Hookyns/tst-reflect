import * as ts                                    from "typescript";
import {Context}                                  from "./visitors/Context";
import {State, STATE_PROP, StateNode}             from "./visitors/State";
import {genericCalleeDeclarationExploringVisitor} from "./visitors/genericCalleeDeclarationExploringVisitor";
import getTypeCall                                from "./getTypeCall";

export function processGenericCallExpression(node: ts.CallExpression, fncType: ts.Type, context: Context): ts.CallExpression | undefined
{
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
			let genericTypeNode = node.typeArguments?.[state.indexesOfGenericParameters[i]];
			let typePropertyVal: ts.Expression;
			let genericType;

			if (genericTypeNode == undefined && state.requestedGenericsReflection)
			{
				const argsIndex = declaration.parameters
					.findIndex(p => p.type && ts.isTypeReferenceNode(p.type) && p.type.typeName.getText() == genericParamName);

				genericType = context.checker.getTypeAtLocation(node.arguments[argsIndex]);
				let symbol = context.checker.getSymbolAtLocation(node.arguments[0]);

				if (symbol)
				{
					genericTypeNode = (symbol.valueDeclaration as any)?.type; // TODO: This is not enough. This works only when the type is declared explicitly. 
				}
			}

			if (genericTypeNode || genericType)
			{
				genericType ??= context.checker.getTypeAtLocation(genericTypeNode!);
				const genericTypeSymbol = genericType.getSymbol();
				typePropertyVal = getTypeCall(
					genericType,
					genericTypeSymbol,
					context.checker,
					context.sourceFileContext,
					genericTypeNode && ts.isTypeReferenceNode(genericTypeNode) ? genericTypeNode.typeName : undefined
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