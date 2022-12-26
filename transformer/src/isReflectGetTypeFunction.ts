import * as ts            from "typescript";
import { Context }        from "./contexts/Context";
import { getDeclaration } from "./helpers";

export function isReflectGetTypeFunction(identifier: ts.Node, context: Context)
{
	const symbol = context.typeChecker.getSymbolAtLocation(identifier);
	let node: ts.Node | undefined = symbol && getDeclaration(symbol);

	if (!node)
	{
		return false;
	}

	let depth = 5;
	do
	{
		node = node.parent;

		if (!node)
		{
			return false;
		}

		if (ts.isImportDeclaration(node))
		{
			return ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text.includes("tst-reflect");
		}

		depth--;
	} while (depth > 0);

	return false;
}