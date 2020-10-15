﻿import * as ts                from "typescript";
import {TYPE_ID_PROPERTY_NAME} from "tst-reflect";
import {SourceFileContext}     from "./declarations";
import getTypeCall             from "./getTypeCall";
import {getSymbol, getType}    from "./helpers";

function visit(context: ts.TransformationContext, program: ts.Program, checker: ts.TypeChecker, node: ts.Node, sourceFileContext: SourceFileContext): ts.Node | undefined
{
	if (ts.isCallExpression(node) && (node.expression as any).escapedText == "getType")
	{
		// Add identifier into context; will be used for all calls
		if (!sourceFileContext.getTypeIdentifier)
		{
			sourceFileContext.getTypeIdentifier = node.expression as ts.Identifier;
		}

		// getType type
		const fncType = checker.getTypeAtLocation(node.expression);

		if (fncType.getProperty(TYPE_ID_PROPERTY_NAME))
		{
			let genericTypeNode = node.typeArguments?.[0] as ts.TypeReferenceNode;

			if (!genericTypeNode)
			{
				throw new Error("Type argument of function getType<T>() is missing.");
			}

			let genericType = checker.getTypeAtLocation(genericTypeNode);

			// Parameter is another generic type
			if (genericType.flags == ts.TypeFlags.TypeParameter)
			{

			}
			// Parameter is specific type
			else
			{
				const genericTypeSymbol = getSymbol(genericTypeNode, checker);

				if (!genericTypeSymbol)
				{
					throw new Error("Symbol o generic type argument not found.")
				}

				const genericTypeType: ts.Type = getType(genericTypeSymbol, checker);
				const getTypeCallExpresion = getTypeCall(genericTypeSymbol, genericTypeType, checker, sourceFileContext, genericTypeNode.typeName);

				// TODO: Test if visitation of own expression is required, maybe just return getTypeCallExpresion
				return ts.visitEachChild(getTypeCallExpresion, sourceFileContext.visitor, context);
			}
		}
	}

	return ts.visitEachChild(node, sourceFileContext.visitor, context);
}

export function getVisitor(context: ts.TransformationContext, program: ts.Program): ts.Visitor
{
	let checker: ts.TypeChecker = program.getTypeChecker();

	return node => {
		const sourceFileContext: SourceFileContext = {
			typesProperties: [],
			visitor: node => visit(context, program, checker, node, sourceFileContext)
		};

		const visitedNode = sourceFileContext.visitor(node);
		const typesIds = Object.keys(sourceFileContext.typesProperties) as any as number[];

		if (visitedNode && !(visitedNode instanceof Array) && ts.isSourceFile(visitedNode) && typesIds.length)
		{
			const propertiesStatements = [];
			const typesProperties = sourceFileContext.typesProperties;

			for (let typeId of typesIds)
			{
				propertiesStatements.push(ts.factory.createExpressionStatement(
					ts.factory.createCallExpression(sourceFileContext?.getTypeIdentifier!, [], [typesProperties[typeId], ts.factory.createNumericLiteral(typeId)])
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

		return visitedNode;
	}
}