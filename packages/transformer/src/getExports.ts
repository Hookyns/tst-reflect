import * as ts                                from "typescript";
import { Context }                            from "./contexts/Context";
import { ConstructorImportDescriptionSource } from "./declarations";
import {
	getDeclaration,
	getOutPathForSourceFile
} from "./helpers";
import { log }                                from "./log";

export function getExportOfConstructor(
	symbol: ts.Symbol,
	context: Context
): ConstructorImportDescriptionSource | undefined
{
	const exportSymbol = context.typeChecker.getExportSymbolOfSymbol(symbol);

	if (!exportSymbol)
	{
		log.warn("getExportOfConstructor: Failed to find export of the constructor.");
		return undefined;
	}

	const classDeclaration = getDeclaration(symbol) as ts.ClassDeclaration;
	const name = classDeclaration?.name?.escapedText?.toString();

	if (!name)
	{
		log.warn("getExportOfConstructor: Failed to get name of exported parent");
		return undefined;
	}
	
	// Type is not exported
	if (!classDeclaration.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) 
	{
		return undefined;
	}

	const source = classDeclaration.getSourceFile();

	return {
		en: exportSymbol.escapedName.toString(),
		n: name,
		srcPath: source.fileName,
		outPath: getOutPathForSourceFile(source.fileName, context),
	};
}
