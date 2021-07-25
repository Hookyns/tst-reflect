import * as ts            from "typescript";
import TransformerContext from "./src/contexts/TransformerContext";
import SourceFileContext  from "./src/contexts/SourceFileContext";
import {nodeGenerator}    from "./src/NodeGenerator";

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
		if (config.debugMode)
		{
			console.log("tst-reflect: getType call visitation started in", (node as any).fileName);
		}

		const sourceFileContext = new SourceFileContext(transformerContext, context, program, typeChecker);
		let visitedNode = sourceFileContext.context.visit(node);

		if (visitedNode && !(visitedNode instanceof Array) && ts.isSourceFile(visitedNode) && sourceFileContext.typesMetadata.length)
		{
			if (config.useMetadata)
			{
				if (!transformerContext.metadataGenerator)
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

				const typeCtor = new Set<ts.EntityName>();

				for (let ctor of sourceFileContext.typesCtors)
				{
					typeCtor.add(ctor);
				}

				transformerContext.metadataGenerator.addProperties(propertiesStatements, typeCtor, context);
			}

			visitedNode = updateSourceFile(sourceFileContext, visitedNode);
		}

		if (config.debugMode)
		{
			console.log("tst-reflect: getType call visitation ended in", (node as any).fileName);
		}

		return visitedNode;
	}
}

function updateSourceFile(sourceFileContext: SourceFileContext, visitedNode: ts.SourceFile)
{
	const statements: Array<ts.Statement> = [];

	if (sourceFileContext.shouldGenerateGetTypeImport)
	{
		const {statement} = nodeGenerator.createGetTypeImport(sourceFileContext.getGetTypeIdentifier());
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

			statements.push(ts.factory.createExpressionStatement(
				ts.factory.createCallExpression(getTypeIdentifier, [], [properties, ts.factory.createNumericLiteral(typeId)])
			));
		}
	}

	const importsCount = visitedNode.statements.findIndex(s => !ts.isImportDeclaration(s));

	if (importsCount == -1)
	{
		console.warn("Reflection: getType<T>() used, but no import found.");
	}

	return ts.factory.updateSourceFile(
		visitedNode,
		importsCount == -1
			? [...statements, ...visitedNode.statements]
			: visitedNode.statements.slice(0, importsCount).concat(statements).concat(visitedNode.statements.slice(importsCount))
	);
}