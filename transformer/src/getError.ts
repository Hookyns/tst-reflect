import * as ts      from "typescript"
import {PACKAGE_ID} from "./helpers";

export function getError(atNode: ts.Node, message: string)
{
	const sourceFile = atNode.getSourceFile();
	const statementText = sourceFile.text.slice(atNode.pos, atNode.end);
	const filePos = sourceFile.getLineAndCharacterOfPosition(atNode.pos);

	return new Error(`${PACKAGE_ID}: ${message}\n\tat ${statementText} (${sourceFile.fileName}:${filePos.line}:${filePos.character})`);
}