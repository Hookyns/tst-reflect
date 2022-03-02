import * as ts                    from "typescript";
import { MetadataTypeValues }     from "../config-options";
import { SourceFileContext }      from "../contexts/SourceFileContext";
import { TransformerContext }     from "../contexts/TransformerContext";
import { NextMetadataMiddleware } from "../declarations";
import type {
	MetadataMiddleware,
	MetadataSource
}                                 from "../declarations";
import { PACKAGE_ID }             from "../helpers";
import {
	color,
	log,
	LogLevel
}                                 from "../log";

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

			// TODO: Write metadata
			// if (visitedNode && sourceFileContext.typesMetadata.length)
			// {
			// 	if (config.metadataType == MetadataTypeValues.typeLib)
			// 	{
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
			// 		transformerContext.metaWriter.writeMetaProperties(propertiesStatements, typeCtor, transformationContext);
			// 	}
			//
			// 	visitedNode = updateSourceFile(sourceFileContext, visitedNode);
			// }

			if (config.debugMode)
			{
				log.trace(`${PACKAGE_ID}: Visitation of file ${node.fileName} has been finished.`);
			}

			// TODO: Add import of metadata library
			// visitedNode = transformerContext.metaWriter.addLibImportToSourceFile(visitedNode);

			return visitedNode;
		};
	}
}

function updateSourceFile(sourceFileContext: SourceFileContext, visitedNode: ts.SourceFile)
{
	const statements: Array<ts.Statement> = [];
	const modules = Array.from(sourceFileContext.metadata.getModules()).map(moduleMetadata => moduleMetadata.getModuleProperties());
	const middlewares: MetadataMiddleware[] = sourceFileContext.transformerContext.config.metadataMiddlewares;


	middlewares.push((context: SourceFileContext, next1: NextMetadataMiddleware) => {
		next1.invoke();
	})

	// MIDDLEWARES
	if (middlewares.length)
	{
		const source: MetadataSource = { modules };
		let middlewareIndex = 0;


		const nextMetadataMiddleware: NextMetadataMiddleware = {
			invoke()
			{
				const middleware = middlewares[middlewareIndex++];

				if (middleware)
				{
					const res = middleware(sourceFileContext, nextMetadataMiddleware)
					return res;
				}

				return prevResult;
			}
		};
		
		function next(prevResult: MetadataSource) {

			const middleware = middlewares[middlewareIndex++];
			
			if (middleware)
			{
				const res = middleware(sourceFileContext, { invoke: () => next() })
				return res;
			}
			
			return prevResult
		}
		
		next(source);
	}

	// Add metadata into statements if metadata lib file is disabled
	if (TransformerContext.instance.config.metadataType == MetadataTypeValues.inline)
	{
		for (let moduleMetadata of modules)
		{
			statements.push(ts.factory.createExpressionStatement(
				sourceFileContext.metaWriter.factory.addDescriptionToStore(typeId, properties)
			));
		}
	}
	else
	{
		const types = sourceFileContext.metadata.getInFileTypes(sourceFileContext.sourceFile);
	}

	const importsCount = visitedNode.statements.findIndex(s => !ts.isImportDeclaration(s));

	if (importsCount == -1)
	{
		log.warn("Reflection: getType<T>() used, but no import found.");
	}

	const finalizedStatements = importsCount == -1
		? [...statements, ...visitedNode.statements]
		: visitedNode.statements.slice(0, importsCount).concat(statements).concat(visitedNode.statements.slice(importsCount));

	return ts.factory.updateSourceFile(visitedNode, finalizedStatements);
}