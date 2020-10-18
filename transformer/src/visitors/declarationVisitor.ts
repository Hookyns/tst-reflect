import * as ts                                    from "typescript";
import {Context}                                  from "./Context";
import {genericCalleeDeclarationExploringVisitor} from "./genericCalleeDeclarationExploringVisitor";
import {GENERIC_PARAMS}                           from "../helpers";

export function declarationVisitor(node: ts.Node, context: Context): ts.Node | undefined
{
	// Update method and function declarations containing getTypes of generic parameter
	if ((ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node)) && node.typeParameters?.length)
	{
		// If it has no body, there is nothing to do
		if (node.body === undefined) {
			return undefined;
		}
		
		const state = genericCalleeDeclarationExploringVisitor(node, context);

		if (state)
		{
			const [modParams, modBody] = modifyDeclaration(node.parameters, node.body);
			
			if (ts.isMethodDeclaration(node))
			{
				node = ts.factory.updateMethodDeclaration(
					node,
					node.decorators,
					node.modifiers,
					node.asteriskToken,
					node.name,
					node.questionToken,
					undefined,
					modParams,
					node.type,
					modBody
				);
			}
			else if (ts.isFunctionDeclaration(node))
			{
				node = ts.factory.updateFunctionDeclaration(
					node,
					node.decorators,
					node.modifiers,
					node.asteriskToken,
					node.name,
					undefined,
					modParams,
					node.type,
					modBody
				);
			}
		}

		return node;
	}
	
	return node;
}

function modifyDeclaration(parameters: ts.NodeArray<ts.ParameterDeclaration>, body: ts.Block): [Array<ts.ParameterDeclaration>, ts.Block] {
	const lastParam = parameters[parameters.length - 1];
	
	// there is no "rest" parameter
	if (!lastParam || lastParam.dotDotDotToken === undefined) {
		return [
			[
				...parameters,
				ts.factory.createParameterDeclaration(
					undefined,
					undefined,
					undefined,
					ts.factory.createIdentifier(GENERIC_PARAMS)
				)
			],
			body
		];
	}
	// "rest" param is gonna be used; modify body to declare GENERIC_PARAMS const and remove values from that "rest" param
	else {
		// TODO: const __genericParam__ = theRestArgs.splice(theRestArgs.length - 1, 1)[0];
		
		return [[...parameters], body];
	}
}