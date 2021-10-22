import * as ts           from "typescript";
import { Context }       from "./contexts/Context";
import {
	FunctionLikeDeclarationGenericParametersDetail,
	FunctionLikeDeclarationGenericParametersDetailNode,
	STATE_PROP
}                        from "./FunctionLikeDeclarationGenericParametersDetail";
import {
	hasAnyReflectJsDoc
}                        from "./helpers";
import { isGetTypeCall } from "./isGetTypeCall";

/**
 * This visitor is just for exploration of declaration, not for modifications.
 * @param node
 * @param context
 */
export function getGenericParametersDetails(node: ts.FunctionLikeDeclarationBase, context: Context): FunctionLikeDeclarationGenericParametersDetail
{
	if (!node.typeParameters?.length)
	{
		return {};
	}

	// Check if details already exists,
	let genericParametersDetail: FunctionLikeDeclarationGenericParametersDetail | undefined = (node as unknown as FunctionLikeDeclarationGenericParametersDetailNode)[STATE_PROP];

	if (genericParametersDetail)
	{
		return genericParametersDetail;
	}

	// TODO: Optimize?! retrieved symbol is equals to node.symbol.
	const symbol = context.typeChecker.getTypeAtLocation(node).getSymbol();

	if (symbol !== undefined)
	{
		// If declaration contains @reflectGeneric in JSDoc comment, pass all generic arguments
		if (hasAnyReflectJsDoc(symbol))
		{
			const genericParams = node.typeParameters.map(p => p.name.escapedText.toString());
			const state: FunctionLikeDeclarationGenericParametersDetail = {
				usedGenericParameters: genericParams,
				indexesOfGenericParameters: genericParams.map((_, index) => index),
				declaredParametersCount: node.parameters.length,
				requestedGenericsReflection: true
			};

			// Store expecting types on original declaration node (cuz that node will be still visited until end of "before" phase, one of the node modifications take effect inside phase)
			(node as unknown as FunctionLikeDeclarationGenericParametersDetailNode)[STATE_PROP] = state;

			return state;
		}
	}

	return context.createNestedContext(exploreGetTypeCalls, context => {
		context.visitFunctionLikeDeclaration(node);

		// If something found
		if (context.usedGenericParameters.length)
		{
			const genericParams = node.typeParameters!.map(p => p.name.escapedText.toString());

			// Store expecting types on original declaration node (cuz that node will be still visited until end of "before" phase, one of the node modifications take effect inside phase)
			const state = {
				usedGenericParameters: context.usedGenericParameters,
				indexesOfGenericParameters: context.usedGenericParameters.map(p => genericParams.indexOf(p)),
				declaredParametersCount: node.parameters.length
			};

			(node as unknown as FunctionLikeDeclarationGenericParametersDetailNode)[STATE_PROP] = state;
			return state;
		}
		else
		{
			// Store empty state; When node has state it means it was visited => It's not gonna be visited twice.
			(node as unknown as FunctionLikeDeclarationGenericParametersDetailNode)[STATE_PROP] = {};
		}

		return {};
	});
}

/**
 * Function exploring getType call with generic argument being generic parameter
 * @param node
 * @param context
 */
function exploreGetTypeCalls(node: ts.Node, context: Context)
{
	let genericTypeNode: false | ts.TypeNode;

	if ((genericTypeNode = isGetTypeCall(node, context)) !== false)
	{
		let genericType = context.typeChecker.getTypeAtLocation(genericTypeNode);

		// Parameter is another generic type
		if (genericType.flags == ts.TypeFlags.TypeParameter
			&& context.usedGenericParameters != undefined
			&& ts.isTypeReferenceNode(genericTypeNode) && ts.isIdentifier(genericTypeNode.typeName))
		{
			context.usedGenericParameters.push(genericTypeNode.typeName.escapedText.toString());
		}

		return node;
	}

	return ts.visitEachChild(node, context.visitor, context.transformationContext);
}