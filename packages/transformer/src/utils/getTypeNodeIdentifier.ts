import * as ts from "typescript";

export function getTypeNodeIdentifier(typeNode: ts.TypeNode): ts.Identifier | undefined
{
	let typeName: ts.Identifier | undefined;

	if (ts.isIndexedAccessTypeNode(typeNode))
	{
		typeName = (typeNode.indexType as any).typeName;
	}
	else
	{
		typeName = (typeNode as any).typeName;
	}

	if (typeName && typeName?.kind === ts.SyntaxKind.Identifier)
	{
		return typeName;
	}

	return undefined;
}