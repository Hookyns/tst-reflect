import * as ts                            from "typescript";
import { createAccessToGenericParameter } from "../expression-utils/createAccessToGenericParameter";
import type { Context }                   from "../contexts/Context";

export function processGetTypeCallExpression(context: Context, node: ts.CallExpression): ts.VisitResult<ts.Node>
{
	// First type argument
	let genericTypeNode = node.typeArguments?.[0];

	// No type argument passed
	if (!genericTypeNode)
	{
		// Calls like "getType(variable)" allowed. It returns runtime value.
		return undefined;
	}

	let genericType = context.typeChecker.getTypeAtLocation(genericTypeNode);

	// Parameter is another generic type; replace by "__genericParam__.X", where X is name of generic parameter
	if (genericType.flags == ts.TypeFlags.TypeParameter)
	{
		if (ts.isTypeReferenceNode(genericTypeNode) && ts.isIdentifier(genericTypeNode.typeName))
		{
			return createAccessToGenericParameter(genericTypeNode); // TODO: Check that genericTypeNode is a function or method type parameter (genericTypeNode.parent?). Because it can be class type parameter and this will throw Error, cuz there will be no variable "__genericParam__" declared
		}

		return undefined;
	}
	// Parameter is specific type
	else
	{
		const typeReference = context.metadata.addType(genericTypeNode, genericType);
		return context.metadata.factory.createTypeResolver(typeReference);
	}
}
