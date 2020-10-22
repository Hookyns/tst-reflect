import * as ts       from "typescript";
import {setConfig}   from "./src/config";

export default function transform(program: ts.Program): ts.TransformerFactory<ts.SourceFile>
{
	setConfig({
		rootDir: program.getCompilerOptions().rootDir || program.getCurrentDirectory()
	});

	return (context): ts.Transformer<ts.SourceFile> =>
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

	return node =>
	{
		console.log("tst-reflect: getType call visitation started in", (node as any).fileName);
		const tstContext: typeof Context = new Context(context, program, checker);

		let visitedNode = tstContext.sourceFileContext.visitor(node);

		const typesIds = Object.keys(tstContext.sourceFileContext.typesProperties) as any as number[];

		if (visitedNode && !(visitedNode instanceof Array) && ts.isSourceFile(visitedNode) && typesIds.length)
		{
			const propertiesStatements = [];
			const typesProperties = tstContext.sourceFileContext.typesProperties;

			for (let typeId of typesIds)
			{
				propertiesStatements.push(ts.factory.createExpressionStatement(
					ts.factory.createCallExpression(tstContext.sourceFileContext?.getTypeIdentifier!, [], [typesProperties[typeId], ts.factory.createNumericLiteral(typeId)])
				));
			}

			const importsCount = visitedNode.statements.findIndex(s => !ts.isImportDeclaration(s));

			if (importsCount == -1)
			{
				console.warn("Reflection: getType<T>() used, but no import found.");
			}

			visitedNode = ts.factory.updateSourceFile(
				visitedNode,
				importsCount == -1
					? [...propertiesStatements, ...visitedNode.statements]
					: visitedNode.statements.slice(0, importsCount).concat(propertiesStatements).concat(visitedNode.statements.slice(importsCount))
			);
		}

		console.log("tst-reflect: getType call visitation ended in", (node as any).fileName);

		return visitedNode;
	}
}