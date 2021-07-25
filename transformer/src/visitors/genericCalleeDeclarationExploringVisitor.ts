import * as ts                        from "typescript";
import {Context}                      from "../contexts/Context";
import {State, STATE_PROP, StateNode} from "./State";
import {isGetTypeCall}                from "../isGetTypeCall";
import {REFLECT_GENERIC_DECORATOR}    from "tst-reflect/reflect";

/**
 * This visitor is just for exploration of declaration, not for modifications.
 * @param node
 * @param context
 */
export function genericCalleeDeclarationExploringVisitor(node: ts.FunctionLikeDeclarationBase, context: Context): State | undefined
{
	if (!node.typeParameters?.length)
	{
		return;
	}

	const symbol = context.typeChecker.getTypeAtLocation(node).getSymbol();

	if (symbol !== undefined)
	{
		const jsdoc = symbol.getJsDocTags();

		// If declaration contains @reflectGeneric in JSDoc comment, pass all generic arguments
		if (jsdoc.some(tag => tag.name === REFLECT_GENERIC_DECORATOR))
		{
			const genericParams = node.typeParameters.map(p => p.name.escapedText.toString());
			const state: State = {
				usedGenericParameters: genericParams,
				indexesOfGenericParameters: genericParams.map((_, index) => index),
				declaredParametersCount: node.parameters.length,
				requestedGenericsReflection: true
			};

			// Store expecting types on original declaration node (cuz that node will be still visited until end of "before" phase, one of the node modifications take effect inside phase)
			(node as unknown as StateNode)[STATE_PROP] = state;

			return state;
		}
	}

	context.createNestedContext(exploreGetTypeCalls, context => {
		context.visitEachChild(node);

		// If something found
		if (context.usedGenericParameters?.length)
		{
			const genericParams = node.typeParameters!.map(p => p.name.escapedText.toString());
			const state: State = {
				usedGenericParameters: context.usedGenericParameters,
				indexesOfGenericParameters: context.usedGenericParameters.map(p => genericParams.indexOf(p)),
				declaredParametersCount: node.parameters.length
			};
			context.usedGenericParameters = undefined;

			// Store expecting types on original declaration node (cuz that node will be still visited until end of "before" phase, one of the node modifications take effect inside phase)
			(node as unknown as StateNode)[STATE_PROP] = state;

			return state;
		}
	});

	// context.usedGenericParameters = [];

	// context.visitEachChildNestContext(node, exploreGetTypeCalls);

	// // Set new visitor into context
	// const oldVisitor = context.visitor;
	// context.visitor = (node) => exploreGetTypeCalls(node, context);
	//
	// ts.visitEachChild(node, context.visitor, context.transformationContext);
	//
	// // Set old visitor back
	// context.visitor = oldVisitor;

	// // If something found
	// if (context.usedGenericParameters.length)
	// {
	// 	const genericParams = node.typeParameters.map(p => p.name.escapedText.toString());
	// 	const state: State = {
	// 		usedGenericParameters: context.usedGenericParameters,
	// 		indexesOfGenericParameters: context.usedGenericParameters.map(p => genericParams.indexOf(p)),
	// 		declaredParametersCount: node.parameters.length
	// 	};
	// 	context.usedGenericParameters = undefined;
	//
	// 	// Store expecting types on original declaration node (cuz that node will be still visited until end of "before" phase, one of the node modifications take effect inside phase)
	// 	(node as unknown as StateNode)[STATE_PROP] = state;
	//
	// 	return state;
	// }

	// Store empty state; means it was visited
	(node as unknown as StateNode)[STATE_PROP] = {};
	context.usedGenericParameters = undefined;
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