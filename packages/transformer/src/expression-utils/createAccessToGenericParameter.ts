import * as ts            from "typescript";
import { GENERIC_PARAMS } from "../helpers";

/**
 * EMIT: __genericParam__ && __genericParam__.X
 * @description genericTypeNode.typeName must be identifier.
 * @param genericTypeNode
 */
export function createAccessToGenericParameter(genericTypeNode: ts.TypeReferenceNode)
{
	return ts.factory.createParenthesizedExpression(
		ts.factory.createBinaryExpression(
			ts.factory.createIdentifier(GENERIC_PARAMS),
			ts.SyntaxKind.AmpersandAmpersandToken,
			ts.factory.createPropertyAccessExpression(
				ts.factory.createIdentifier(GENERIC_PARAMS),
				ts.factory.createIdentifier((genericTypeNode.typeName as ts.Identifier).escapedText.toString())
			)
		)
	);
}