import * as ts from "typescript";

export function getNodeLocationText(atNode: ts.Node)
{
	const sourceFile = atNode.getSourceFile();
	const statementText = sourceFile.text.slice(atNode.pos, atNode.end);
	const filePos = sourceFile.getLineAndCharacterOfPosition(atNode.pos);

	return `${statementText.trim()} (${sourceFile.fileName}:${filePos.line}:${filePos.character})`;
}