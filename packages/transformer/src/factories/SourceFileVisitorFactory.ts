import * as ts                from "typescript";
import { MetadataTypeValues } from "../config-options";
import { SourceFileContext }  from "../contexts/SourceFileContext";
import { TransformerContext } from "../contexts/TransformerContext";
import {
	MetadataSource,
	TransformerTypeReference
}                                from "../declarations";
import { PACKAGE_ID }            from "../helpers";
import { MiddlewareResult }      from "../middlewares";
import { processMiddlewares }    from "../middlewares/processMiddlewares";
import { updateSourceFile }      from "../transformers/updateSourceFile";
import {
	color,
	log,
	LogLevel
}                                from "../log";
import { createValueExpression } from "../utils/createValueExpression";

/**
 * Factory of SourceFile visitor.
 */
export class SourceFileVisitorFactory
{
	/**
	 * @param transformationContext
	 * @param program
	 */
	constructor(private readonly transformationContext: ts.TransformationContext, private readonly program: ts.Program)
	{
	}

	create(): ts.Visitor
	{
		const transformerContext = TransformerContext.instance;
		const transformationContext = this.transformationContext;
		const config = transformerContext.config;

		return node =>
		{
			// It should always be a SourceFile, but check it, just for case.
			if (!ts.isSourceFile(node))
			{
				return node;
			}

			if (config.debugMode)
			{
				log.log(LogLevel.Trace, color.cyan, `${PACKAGE_ID}: Visitation of file ${node.fileName} started.`);
			}

			// Create Context for the SourceFile
			const sourceFileContext = new SourceFileContext(node, transformerContext, transformationContext);

			// Set Current SourceFileContext into the TransformerContext
			transformerContext.setSourceFileContext(sourceFileContext);

			// Visit node
			let visitedNode = sourceFileContext.context.visit(node) as ts.SourceFile;

			// PLUGINS
			for (let plugin of config.plugins)
			{
				plugin.visit(node, sourceFileContext);
			}

			if (visitedNode)
			{
				const modules = Array.from(sourceFileContext.metadata.getModules()).map(moduleMetadata => moduleMetadata.getModuleProperties());

				// Filter 
				if (config.metadataType == MetadataTypeValues.inline)
				{
					for (const module of modules) {
						const typesInFile: TransformerTypeReference[] = sourceFileContext.metadata.getInFileTypes(sourceFileContext.sourceFile);
						module.types = module.types?.filter(type => typesInFile.some(typeInFileReference => type.id == typeInFileReference || (type.id == undefined && type.kind == typeInFileReference)));
					}
				}
				
				const source: MetadataSource = { modules };
				const metadata: MiddlewareResult = processMiddlewares(sourceFileContext, source);

				if (metadata)
				{
					const metadataExpression = createValueExpression(metadata);
					
					// Update typelib
					if (config.metadataType == MetadataTypeValues.typeLib)
					{
						visitedNode = updateSourceFile(
							visitedNode, 
							[
								sourceFileContext.metadata.factory.createTypeLibImport(sourceFileContext.sourceFile)
							]
						);
						
						// 		const propertiesStatements: Array<[number, ts.ObjectLiteralExpression]> = [];
						// 		const typeIdUniqueObj: { [key: number]: boolean } = {};
						//
						// 		for (let [typeId, properties] of sourceFileContext.typesMetadata)
						// 		{
						// 			if (typeIdUniqueObj[typeId])
						// 			{
						// 				continue;
						// 			}
						//
						// 			typeIdUniqueObj[typeId] = true;
						// 			propertiesStatements.push([typeId, properties]);
						// 		}
						//
						// 		const typeCtor = new Set<ts.PropertyAccessExpression>();
						// 		for (let ctor of sourceFileContext.typesCtors)
						// 		{
						// 			typeCtor.add(ctor);
						// 		}
						//
						transformerContext.metadata.writer.writeModule(metadataExpression);//writeMetaProperties(propertiesStatements, typeCtor, transformationContext);
					}
					else if (config.metadataType == MetadataTypeValues.inline) 
					{
						console.warn("Mode 'inline' is not implemented yet.");
						
						//const types = sourceFileContext.metadata.getInFileTypes(sourceFileContext.sourceFile);

						// for (let moduleMetadata of modules)
						// {
						// 	statements.push(ts.factory.createExpressionStatement(
						// 		sourceFileContext.metaWriter.factory.addDescriptionToStore(typeId, properties)
						// 	));
						// }
					}
				}
			}

			if (config.debugMode)
			{
				log.trace(`${PACKAGE_ID}: Visitation of file ${node.fileName} has been finished.`);
			}

			return visitedNode;
		};
	}
}