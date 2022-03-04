import * as ts                from "typescript";
import { MetadataTypeValues } from "../config-options";
import { SourceFileContext }  from "../contexts/SourceFileContext";
import { TransformerContext } from "../contexts/TransformerContext";
import { PACKAGE_ID }         from "../helpers";
import { updateSourceFile }   from "../transformers/updateSourceFile";
import {
	color,
	log,
	LogLevel
}                             from "../log";

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

			// Update current SourceFile (inline mode and/or local only types)
			if (visitedNode)
			{
				visitedNode = updateSourceFile(sourceFileContext, visitedNode);
			}

			if (config.metadataType == MetadataTypeValues.typeLib)
			{
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
			}

			if (config.debugMode)
			{
				log.trace(`${PACKAGE_ID}: Visitation of file ${node.fileName} has been finished.`);
			}

			return visitedNode;
		};
	}
}