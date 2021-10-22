import * as ts                                            from "typescript";
import { FunctionLikeDeclarationGenericParametersDetail } from "./FunctionLikeDeclarationGenericParametersDetail";

export type TypeArgumentValueDescription = { genericTypeName: string, reflectedType: ts.Expression };

export function updateCallExpression(
	node: ts.CallExpression,
	state: FunctionLikeDeclarationGenericParametersDetail,
	typeArgumentsTypes: Array<TypeArgumentValueDescription>
)
{
	const callArgs = [...node.arguments];

	if (callArgs.length < state.declaredParametersCount!)
	{
		for (let i = state.declaredParametersCount! - callArgs.length; i > 0; --i)
		{
			callArgs.push(ts.factory.createIdentifier("undefined"));
		}
	}

	const args: Array<ts.PropertyAssignment> = [];

	for (let param of typeArgumentsTypes)
	{
		args.push(
			ts.factory.createPropertyAssignment(
				param.genericTypeName,
				param.reflectedType
			)
		);
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