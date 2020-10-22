import * as ts                        from "typescript";
import {Context}                      from "./Context";
import {State, STATE_PROP, StateNode} from "./State";
import {isGetTypeCall}                from "../isGetTypeCall";

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

	context.usedGenericParameters = [];

	// TODO: Debug; node.name.escapedText == "printType"; 
	
	// Set new visitor into context
	const oldVisitor = context.visitor;
	context.visitor = (node) => exploreGetTypeCalls(node, context);

	ts.visitEachChild(node, context.visitor, context.transformationContext);

	// Set old visitor back
	context.visitor = oldVisitor;

	// If something found
	if (context.usedGenericParameters.length)
	{
		const genericParams = node.typeParameters.map(p => p.name.escapedText.toString());
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
		let genericType = context.checker.getTypeAtLocation(genericTypeNode);

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