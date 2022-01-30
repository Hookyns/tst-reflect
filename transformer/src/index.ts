import * as ts            from "typescript";
import SourceFileContext  from "./contexts/SourceFileContext";
import TransformerContext from "./contexts/TransformerContext";
import { PACKAGE_ID }     from "./helpers";
import {
	color,
	log,
	LogLevel
}                         from "./log";
import { nodeGenerator }  from "./NodeGenerator";


export default function transform(program: ts.Program): ts.TransformerFactory<ts.SourceFile>
{
	TransformerContext.instance.init(program);

	return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> =>
	{
		return (node) => ts.visitNode(node, getVisitor(context, program));
	};
}

/**
 * @param context
 * @param program
 */
function getVisitor(context: ts.TransformationContext, program: ts.Program): ts.Visitor
{
	const typeChecker: ts.TypeChecker = program.getTypeChecker();
	const transformerContext = TransformerContext.instance;
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

		const sourceFileContext = new SourceFileContext(transformerContext, context, program, typeChecker, node);
		let visitedNode = sourceFileContext.context.visit(node) as ts.SourceFile;

		if (visitedNode && sourceFileContext.typesMetadata.length)
		{
			if (config.useMetadata || transformerContext.metaWriter)
			{
				if (!transformerContext.metadataGenerator && !transformerContext.metaWriter)
				{
					throw new Error("MetadataGenerator does not exists.");
				}

				const propertiesStatements: Array<[number, ts.ObjectLiteralExpression]> = [];
				const typeIdUniqueObj: { [key: number]: boolean } = {};

				for (let [typeId, properties] of sourceFileContext.typesMetadata)
				{
					if (typeIdUniqueObj[typeId])
					{
						continue;
					}

					typeIdUniqueObj[typeId] = true;
					propertiesStatements.push([typeId, properties]);
				}

				const typeCtor = new Set<ts.PropertyAccessExpression>();
				for (let ctor of sourceFileContext.typesCtors)
				{
					typeCtor.add(ctor);
				}

				if (transformerContext.metadataGenerator)
				{
					transformerContext.metadataGenerator.addProperties(propertiesStatements, typeCtor, context);
				}
				if (transformerContext.metaWriter)
				{
					transformerContext.metaWriter.addProperties(propertiesStatements, typeCtor, context);
				}

			}

			visitedNode = updateSourceFile(sourceFileContext, visitedNode);
		}

		if (config.debugMode)
		{
			log.trace(`${PACKAGE_ID}: Visitation of file ${node.fileName} has been finished.`);
		}

		if (transformerContext.metaWriter)
		{
			visitedNode = transformerContext.metaWriter.addLibImportToSourceFile(visitedNode);
		}
		return visitedNode;
	};
}

function updateSourceFile(sourceFileContext: SourceFileContext, visitedNode: ts.SourceFile)
{
	const statements: Array<ts.Statement> = [];

	if (sourceFileContext.shouldGenerateGetTypeImport && !sourceFileContext.metaWriter)
	{
		const { statement } = nodeGenerator.createGetTypeImport(sourceFileContext.getGetTypeIdentifier());
		statements.push(statement);
	}

	// Must be called after "sourceFileContext.shouldGenerateGetTypeImport" check otherwise the information will be lost cuz shouldGenerateGetTypeImport will be set to true
	const getTypeIdentifier = sourceFileContext.getGetTypeIdentifier();

	const typeIdUniqueObj: { [key: number]: boolean } = {};

	// Add metadata into statements if metadata lib file is disabled
	if (!TransformerContext.instance.config.useMetadata)
	{
		for (let [typeId, properties] of sourceFileContext.typesMetadata)
		{
			if (typeIdUniqueObj[typeId])
			{
				continue;
			}
			typeIdUniqueObj[typeId] = true;

			if (sourceFileContext.metaWriter)
			{
				// statements.push(ts.factory.createExpressionStatement(
				// 	ts.factory.createCallExpression(
				// 		sourceFileContext.metaWriter.newGetTypeIdentifier.sourceFile,
				// 		[],
				// 		[ts.factory.createNumericLiteral(typeId)]
				// 	)
				// ));
				continue;
			}

			statements.push(ts.factory.createExpressionStatement(
				ts.factory.createCallExpression(getTypeIdentifier, [], [properties, ts.factory.createNumericLiteral(typeId)])
			));
		}
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
