import * as path                              from "path";
import * as ts                                from "typescript";
import { Context }                            from "./contexts/Context";
import TransformerContext                     from "./contexts/TransformerContext";
import { ConstructorImportDescriptionSource } from "./declarations";
import {
	getImportFilePathForRuntime,
	isTsNode
}                                             from "./helpers";
import { log }                                from "./log";

export function getExportOfConstructor(
	symbol: ts.Symbol,
	typeCtor: ts.EntityName | ts.DeclarationName,
	context: Context
): ConstructorImportDescriptionSource | undefined
{
	const exportSymbol = context.typeChecker.getExportSymbolOfSymbol(symbol);

	if (!exportSymbol)
	{
		log.warn("getExportOfConstructor: Failed to find export of the constructor.");
		return undefined;
	}

	const classDeclaration = symbol.valueDeclaration as ts.ClassDeclaration;

	const name = classDeclaration?.name?.escapedText?.toString();
	if (!name)
	{
		log.warn("getExportOfConstructor: Failed to get name of exported parent");
		return undefined;
	}

	const source = classDeclaration.getSourceFile();
	const ctorSource = typeCtor.getSourceFile();

	const relativePath = "./" + path.relative(path.dirname(ctorSource.fileName), source.fileName);

	const outDir = context.transformationContext.getCompilerOptions().outDir;
	const rootDir = context.transformationContext.getCompilerOptions().rootDir;
	if (!outDir || !rootDir)
	{
		log.warn(`getExportOfConstructor: No "outDir" specified in tsconfig file.`);
		return undefined;
	}

	let outPath = getImportFilePathForRuntime(source.fileName, rootDir, outDir);

	return {
		exportedName: exportSymbol.escapedName.toString(),
		name: name,
		filePath: source.fileName,
		relativePath: relativePath,
		requirePath: outPath,
	};
}
