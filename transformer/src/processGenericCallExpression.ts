import { FunctionLikeDeclarationBase }                    from "typescript";
import * as ts                                            from "typescript";
import { Context }                                        from "./contexts/Context";
import { FunctionLikeDeclarationGenericParametersDetail } from "./FunctionLikeDeclarationGenericParametersDetail";
import { getGenericParametersDetails }                    from "./getGenericParametersDetails";
import getTypeCall                                        from "./getTypeCall";
import {
	TypeArgumentValueDescription,
	updateCallExpression
}                                                         from "./updateCallExpression";

export function processGenericCallExpression(node: ts.CallExpression, fncType: ts.Type, context: Context): ts.CallExpression | undefined
{
	if (!fncType.symbol.declarations)
	{
		throw new Error("Unable to resolve declarations of symbol.");
	}

	// Method/function declaration
	const relevantDeclarations = (fncType.symbol.declarations as ts.FunctionLikeDeclarationBase[]).filter(dec => dec.typeParameters?.length);
	const declaration = relevantDeclarations.find(d => d.body !== undefined) ?? relevantDeclarations[0];

	// Try to get State
	const state: FunctionLikeDeclarationGenericParametersDetail = getGenericParametersDetails(declaration, context, fncType.symbol.declarations as ts.FunctionLikeDeclarationBase[]);

	if (state && state.usedGenericParameters && state.indexesOfGenericParameters)
	{
		const args: Array<TypeArgumentValueDescription> = [];
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

				genericType = context.typeChecker.getTypeAtLocation(node.arguments[argsIndex]);
				let symbol = context.typeChecker.getSymbolAtLocation(node.arguments[0]);

				if (symbol)
				{
					genericTypeNode = (symbol.valueDeclaration as any)?.type; // TODO: This is not enough. This works only when the type is declared explicitly. 
				}
			}

			if (genericTypeNode || genericType)
			{
				genericType ??= context.typeChecker.getTypeAtLocation(genericTypeNode!);
				const genericTypeSymbol = genericType.getSymbol();
				typePropertyVal = getTypeCall(
					genericType,
					genericTypeSymbol,
					context,
					genericTypeNode && ts.isTypeReferenceNode(genericTypeNode) ? genericTypeNode.typeName : undefined
				);
			}
			else
			{
				typePropertyVal = ts.factory.createIdentifier("undefined");
			}

			args.push({
				genericTypeName: genericParamName,
				reflectedType: typePropertyVal
			});

			i++;
		}

		return updateCallExpression(node, state, args);
	}

	return undefined;
}