import * as ts                   from "typescript";
import { MetadataTypeValues }    from "../config-options";
import { SourceFileContext }     from "../contexts/SourceFileContext";
import { log }                   from "../log";
import { MiddlewareResult }      from "../middlewares";
import { createValueExpression } from "../utils/createValueExpression";

export function updateSourceFile(sourceFileContext: SourceFileContext, visitedNode: ts.SourceFile, metadata: MiddlewareResult): ts.SourceFile
{
	if (!metadata)
	{
		return visitedNode;
	}

	const importsCount = visitedNode.statements.findIndex(s => !ts.isImportDeclaration(s));

	if (importsCount == -1)
	{
		log.warn("Reflection: getType<T>() used, but no import found.");
	}

	const statements: Array<ts.Statement> = [];

	// Add metadata into statements if metadata lib file is disabled
	if (sourceFileContext.transformerContext.config.metadataType == MetadataTypeValues.inline)
	{
		const metadataExpression = createValueExpression(metadata);
		console.warn("Mode 'inline' is not implemented yet.");
		//const types = sourceFileContext.metadata.getInFileTypes(sourceFileContext.sourceFile);

		// for (let moduleMetadata of modules)
		// {
		// 	statements.push(ts.factory.createExpressionStatement(
		// 		sourceFileContext.metaWriter.factory.addDescriptionToStore(typeId, properties)
		// 	));
		// }
	}
	else if (sourceFileContext.transformerContext.config.metadataType == MetadataTypeValues.typeLib)
	{
		statements.push(sourceFileContext.metadata.factory.createTypeLibImport(sourceFileContext.sourceFile));
		// visitedNode = transformerContext.metaWriter.addLibImportToSourceFile(visitedNode);
	}

	const finalizedStatements = importsCount == -1
		? [...statements, ...visitedNode.statements]
		: visitedNode.statements.slice(0, importsCount).concat(statements).concat(visitedNode.statements.slice(importsCount));

	return ts.factory.updateSourceFile(visitedNode, finalizedStatements);
}