import * as ts                                            from "typescript";
import { Context }                                        from "./contexts/Context";
import { FunctionLikeDeclarationGenericParametersDetail } from "./FunctionLikeDeclarationGenericParametersDetail";
import { getGenericParametersDetails }                    from "./getGenericParametersDetails";
import { getNodeLocationText }                            from "./getNodeLocationText";
import { getTypeCall }                                    from "./getTypeCall";
import {
	getUnknownTypeCall,
	isArrayType
}                                                         from "./helpers";
import { log }                                            from "./log";
import {
	TypeArgumentValueDescription,
	updateCallExpression
}                                                         from "./updateCallExpression";

export function processGenericCallExpression(node: ts.CallExpression, fncType: ts.Type, context: Context): ts.CallExpression | undefined
{
	if (!fncType.symbol?.declarations)
	{
		if (context.config.debugMode)
		{
			context.log.debug("Unable to resolve declaration of the generic type's symbol signature.\r\n" + getNodeLocationText(node));
		}
		
		return undefined;
	}

	// Method/function declaration; take the only one or find right declaration by signature.
	const declaration = (fncType.symbol.declarations.length > 1
		? (
			context.typeChecker.getResolvedSignature(node)?.declaration
			|| context.typeChecker.getSignaturesOfType(fncType, ts.SignatureKind.Call)
		)
		: fncType.symbol.declarations[0]) as ts.FunctionLikeDeclarationBase | undefined;

	if (!declaration)
	{
		log.error("Unable to resolve declaration of symbol signature.");
		return undefined;
	}

	// Try to get State
	const state: FunctionLikeDeclarationGenericParametersDetail = getGenericParametersDetails(
		declaration,
		context,
		fncType.symbol.declarations as ts.FunctionLikeDeclarationBase[]
	);

	if (state && state.usedGenericParameters && state.indexesOfGenericParameters)
	{
		const args: Array<TypeArgumentValueDescription> = [];
		let i = 0;

		for (let genericParamName of state.usedGenericParameters)
		{
			let typeArgumentNode = node.typeArguments?.[state.indexesOfGenericParameters[i]];
			let typePropertyVal: ts.Expression;
			let genericType: ts.Type | undefined;

			if (typeArgumentNode == undefined)
			{
				let argsIndex = 0;
				
				for (const parameter of declaration.parameters)
				{
					if (parameter.type)
					{
						let type = parameter.type, isArrayTypeNode;

						if ((isArrayTypeNode = ts.isArrayTypeNode(parameter.type)))
						{
							type = parameter.type.elementType;
						}

						if (ts.isTypeReferenceNode(type) && type.typeName.getText() == genericParamName)
						{
							genericType = context.typeChecker.getTypeAtLocation(node.arguments[argsIndex]);

							// Target type is Array and it is not rest parameter, so we have to take type element of array argument
							if (isArrayTypeNode && !parameter.dotDotDotToken)
							{
								if (isArrayType(genericType))
								{
									genericType = (genericType as any).resolvedTypeArguments?.[0];
								}
								else
								{
									genericType = undefined;
									break;
								}
							}

							let symbol = context.typeChecker.getSymbolAtLocation(node.arguments[0]);

							if (symbol)
							{
								typeArgumentNode = (symbol.valueDeclaration as any)?.type; // TODO: This is not enough. This works only when the type is declared explicitly. 
							}

							break;
						}
					}
					argsIndex++;
				}
			}

			if (typeArgumentNode || genericType)
			{
				genericType ??= context.typeChecker.getTypeAtLocation(typeArgumentNode!);
				const genericTypeSymbol = genericType.getSymbol();
				typePropertyVal = getTypeCall(
					genericType,
					genericTypeSymbol,
					context,
					typeArgumentNode && ts.isTypeReferenceNode(typeArgumentNode) ? typeArgumentNode.typeName : undefined
				);
			}
			else
			{
				typePropertyVal = getUnknownTypeCall(context);
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