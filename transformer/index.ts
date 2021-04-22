import * as ts                        from "typescript";
import {transformerContext}           from "./src/TransformerContext";
import type {Context as VisitContext} from "./src/visitors/Context";

export default function transform(program: ts.Program): ts.TransformerFactory<ts.SourceFile>
{
	transformerContext.init(program);

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
	let checker: ts.TypeChecker = program.getTypeChecker();
	const {Context} = require("./src/visitors/Context");
	const config = transformerContext.config;

	return node =>
	{
		if (config.debugMode)
		{
			console.log("tst-reflect: getType call visitation started in", (node as any).fileName);
		}

		const tstContext: VisitContext = new Context(context, program, checker);
		
		let visitedNode = tstContext.sourceFileContext.visitor(node);
		
		const typesProperties: Array<[typeId: number, properties: ts.ObjectLiteralExpression]> = tstContext.sourceFileContext.typesProperties;

		if (visitedNode && !(visitedNode instanceof Array) && ts.isSourceFile(visitedNode) && typesProperties.length)
		{
			if (config.useMetadata)
			{
				const propertiesStatements: Array<[number, ts.ObjectLiteralExpression]> = [];
				const typeIdUniqueObj: { [key: number]: boolean } = {};

				for (let [typeId, properties] of typesProperties)
				{
					if (typeIdUniqueObj[typeId])
					{
						continue;
					}
					
					typeIdUniqueObj[typeId] = true;
					propertiesStatements.push([typeId, properties]);
				}
				
				transformerContext.metadataGenerator?.addTypesProperties(propertiesStatements);
			}
			else
			{
				visitedNode = updateSourceFile(typesProperties, tstContext, visitedNode);
			}
		}

		if (config.debugMode)
		{
			console.log("tst-reflect: getType call visitation ended in", (node as any).fileName);
		}

		return visitedNode;
	}
}

function updateSourceFile(typesProperties: Array<[typeId: number, properties: ts.ObjectLiteralExpression]>, tstContext: VisitContext, visitedNode: ts.SourceFile)
{
	const propertiesStatements = [];
	const typeIdUniqueObj: { [key: number]: boolean } = {};

	for (let [typeId, properties] of typesProperties)
	{
		if (typeIdUniqueObj[typeId])
		{
			continue;
		}
		typeIdUniqueObj[typeId] = true;

		propertiesStatements.push(ts.factory.createExpressionStatement(
			ts.factory.createCallExpression(tstContext.sourceFileContext?.getTypeIdentifier!, [], [properties, ts.factory.createNumericLiteral(typeId)])
		));
	}

	const importsCount = visitedNode.statements.findIndex(s => !ts.isImportDeclaration(s));

	if (importsCount == -1)
	{
		console.warn("Reflection: getType<T>() used, but no import found.");
	}

	return ts.factory.updateSourceFile(
		visitedNode,
		importsCount == -1
			? [...propertiesStatements, ...visitedNode.statements]
			: visitedNode.statements.slice(0, importsCount).concat(propertiesStatements).concat(visitedNode.statements.slice(importsCount))
	);
}