import * as ts                         from "typescript";
import { Context }                     from "../contexts/Context";
import { getError }                    from "../getError";
import { getNodeLocationText }         from "../getNodeLocationText";
import { GENERIC_PARAMS }              from "../helpers";
import { getGenericParametersDetails } from "../getGenericParametersDetails";
import { log }                         from "../log";

const InstanceKey: symbol = Symbol.for("tst-reflect.DeclarationVisitor");
let instance: DeclarationVisitor = (global as any)[InstanceKey] || null;

export default class DeclarationVisitor
{
	/**
	 * Get singleton instance of DeclarationVisitor.
	 */
	static get instance(): DeclarationVisitor
	{
		if (!instance)
		{
			instance = Reflect.construct(DeclarationVisitor, [], Activator);
		}

		return instance;
	}

	/**
	 * Visitor, which will process (check and update) Method and Function declarations.
	 * @param node
	 * @param context
	 */
	visitDeclaration(node: ts.Node, context: Context): ts.Node | undefined
	{
		// Update method and function declarations containing getTypes of generic parameter
		if ((ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node))/* && node.typeParameters?.length && !(node as unknown as StateNode)[STATE_PROP]*/)
		{
			// If it has no body, there is nothing to do
			if (node.body === undefined)
			{
				if (context.config.debugMode)
				{
					log.info("Visiting declaration without body.");
				}

				return undefined;
			}

			const genericParametersDetails = getGenericParametersDetails(node, context, []);

			// Do NOT continue, if it has no generic parameter's details
			if (!genericParametersDetails.usedGenericParameters)
			{
				return node;
			}

			return DeclarationVisitor.modifyDeclaration(node, context);
		}

		return node;
	}

	/**
	 * Modify method/function declaration
	 * @param node
	 * @param context
	 * @private
	 */
	private static modifyDeclaration(node: ts.MethodDeclaration | ts.FunctionDeclaration, context: Context): ts.MethodDeclaration | ts.FunctionDeclaration
	{
		const [modParams, modBody] = DeclarationVisitor.getModifiedDeclarationProperties(node.parameters, node.body!, context);

		if (ts.isMethodDeclaration(node))
		{
			return ts.factory.updateMethodDeclaration(
				node,
				node.decorators,
				node.modifiers,
				node.asteriskToken,
				node.name,
				node.questionToken,
				node.typeParameters,
				modParams,
				node.type,
				modBody
			);
		}

		// else if (ts.isFunctionDeclaration(node))
		return ts.factory.updateFunctionDeclaration(
			node,
			node.decorators,
			node.modifiers,
			node.asteriskToken,
			node.name,
			node.typeParameters,
			modParams,
			node.type,
			modBody
		);
	}

	/**
	 * Modify method/function declaration
	 * @param parameters
	 * @param body
	 * @param context
	 * @private
	 */
	private static getModifiedDeclarationProperties(parameters: ts.NodeArray<ts.ParameterDeclaration>, body: ts.Block, context: Context): [ts.ParameterDeclaration[], ts.Block]
	{
		const lastParam = parameters[parameters.length - 1];

		const argumentsIdentifier = ts.factory.createIdentifier("arguments");
		const argumentsLength = ts.factory.createPropertyAccessExpression(
			argumentsIdentifier,
			ts.factory.createIdentifier("length")
		);

		// there is no "rest" parameter
		if (!lastParam || lastParam.dotDotDotToken === undefined)
		{
			return [
				parameters as unknown as ts.ParameterDeclaration[],
				ts.factory.createBlock(
					[
						ts.factory.createVariableStatement(
							undefined,
							[
								ts.factory.createVariableDeclaration(
									GENERIC_PARAMS,
									undefined,
									undefined,
									ts.factory.createElementAccessExpression(
										argumentsIdentifier,
										ts.factory.createPrefixDecrement(
											argumentsLength
										)
									)
								)
							]
						),
						ts.factory.createExpressionStatement(
							ts.factory.createDeleteExpression(
								ts.factory.createElementAccessExpression(
									argumentsIdentifier,
									argumentsLength
								)
							)
						),
						...body.statements
					]
				)
			];
		}
		// "rest" param is gonna be used; modify body to declare GENERIC_PARAMS const and remove values from that "rest" param
		else if (ts.isIdentifier(lastParam.name))
		{
			// TODO: const __genericParam__ = theRestArgs.splice(theRestArgs.length - 1, 1)[0];
			body = ts.factory.createBlock(
				[
					ts.factory.createVariableStatement(
						undefined, //[ts.factory.createModifier(ts.SyntaxKind.ConstKeyword)],
						[
							ts.factory.createVariableDeclaration(
								GENERIC_PARAMS,
								undefined,
								undefined,
								ts.factory.createElementAccessExpression(
									ts.factory.createCallExpression(
										ts.factory.createPropertyAccessExpression(
											ts.factory.createIdentifier(lastParam.name.escapedText.toString()),
											ts.factory.createIdentifier("splice")
										),
										undefined,
										[
											ts.factory.createBinaryExpression(
												ts.factory.createPropertyAccessExpression(
													ts.factory.createIdentifier(lastParam.name.escapedText.toString()),
													ts.factory.createIdentifier("length")
												),
												ts.SyntaxKind.MinusToken,
												ts.factory.createNumericLiteral(1)
											),
											ts.factory.createNumericLiteral(1)
										]
									),
									0
								)
							)
						]
					),
					ts.factory.createExpressionStatement(
						ts.factory.createDeleteExpression(
							ts.factory.createElementAccessExpression(
								argumentsIdentifier,
								ts.factory.createPrefixDecrement(
									argumentsLength
								)
							)
						)
					),
					...body.statements
				]
			);

			return [
				parameters as unknown as ts.ParameterDeclaration[],
				body
			];
		}
		else if (ts.isArrayBindingPattern(lastParam.name))
		{
			// TODO: Implement
			context.log.warn("ArrayBindingPattern not supported in generic declarations yet. At " + getNodeLocationText(lastParam));
		}
		else if (ts.isObjectBindingPattern(lastParam.name))
		{
			// TODO: Implement
			context.log.warn("ObjectBindingPattern not supported in generic declarations yet. At " + getNodeLocationText(lastParam));
		}

		return [[...parameters], body];
	}
}

class Activator extends DeclarationVisitor
{
}