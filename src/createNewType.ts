import * as ts                                                 from "typescript";
import {TypeKind, TypePropertiesSource, GetTypeCall}           from "../types";
import {getSymbol, getTypeFullName, getTypeKind, isNativeType} from "./helpers";
import {createValueExpression}                                 from "./createValueExpression";
import {getProperties}                                         from "./getProperties";
import {getDecorators}                                         from "./getDecorators";
import {getConstructors}                                       from "./getConstructors";

const createdTypes: Map<number, GetTypeCall> = new Map<number, GetTypeCall>();

function getTypeProperties(symbol: ts.Symbol | undefined, type: ts.Type, checker: ts.TypeChecker): TypePropertiesSource
{
	if (isNativeType(type))
	{
		return {
			n: (type as any).intrinsicName,
			fn: (type as any).intrinsicName,
			k: TypeKind.Native,
			ctors: undefined,
			decs: undefined,
			props: undefined
		};
	}

	if (symbol?.valueDeclaration && (
		ts.isPropertyDeclaration(symbol.valueDeclaration) || ts.isVariableDeclaration(symbol.valueDeclaration)
	))
	{
		let isUnion = false, isIntersection = false;

		if (symbol.valueDeclaration.type && (
			(isUnion = ts.isUnionTypeNode(symbol.valueDeclaration.type)) || (isIntersection = ts.isIntersectionTypeNode(symbol.valueDeclaration.type))
		))
		{
			const types = symbol.valueDeclaration.type.types
				.map(typeNode => createNewType(
					getSymbol(typeNode, checker),
					checker.getTypeAtLocation(typeNode),
					checker
					)
				);

			return {
				k: TypeKind.Container,

				types: types,
				union: isUnion,
				inter: isIntersection
			}
		}
	}

	const typeSymbol = type.getSymbol();

	if (!typeSymbol)
	{
		throw new Error("Enable to resolve type's symbol.");
	}

	const decorators = getDecorators(typeSymbol, checker) || [];

	return {
		n: typeSymbol.getName(),
		fn: getTypeFullName(type, typeSymbol),
		props: getProperties(symbol, checker),
		ctors: getConstructors(type, checker),
		decs: decorators,
		k: getTypeKind(typeSymbol)
	};
}

export default function createNewType(symbol: ts.Symbol | undefined, type: ts.Type, checker: ts.TypeChecker, types?: Array<GetTypeCall>): GetTypeCall
{
	const id: number | undefined = (type.symbol as any)?.["id"];

	if (id)
	{
		const existing = createdTypes.get(id);

		if (existing)
		{
			// return existing;
			return ts.factory.createCallExpression(ts.factory.createIdentifier("getType"), [], [ts.factory.createNumericLiteral(id)])
		}
	}

	try
	{
		const props = getTypeProperties(symbol, type, checker);
		const newType = ts.factory.createCallExpression(
			ts.createIdentifier("getype"), 
			[], 
			[id ? ts.factory.createNumericLiteral(id) : ts.factory.createNull(), createValueExpression(props)]
		);
		// const newType = ts.factory.createNewExpression(ts.createIdentifier("Type"), [], [createValueExpression(props)]);

		if (id)
		{
			createdTypes.set(id, newType);
			types?.push(newType);
			
			// if (addToSourceFile(symbol as ts.Symbol, newType)) {
				return ts.factory.createCallExpression(ts.factory.createIdentifier("getType"), [], [ts.factory.createNumericLiteral(id)])
			// }
		}

		return newType;
	}
	catch (ex)
	{
		console.error(ex);
		throw ex;
	}
}

// function addToSourceFile(symbol: ts.Symbol | undefined, expr: GetTypeCall)
// {
// 	if (!symbol)
// 	{
// 		return false;
// 	}
//
// 	let node: ts.Node = symbol.declarations[0];
//
// 	if (!node)
// 	{
// 		return false;
// 	}
//
// 	while (node && !ts.isSourceFile(node))
// 	{
// 		node = node.parent;
// 	}
//
// 	if (!node)
// 	{
// 		return false;
// 	}
//
// 	ts.factory.updateSourceFile(node, [ts.factory.createExpressionStatement(expr), ...node.statements ]);
//
// 	return true;
// 	// ts.factory.updateSourceFile(node, [
// 	// 	ts.factory.createVariableStatement(
// 	// 		undefined,
// 	// 		ts.factory.createVariableDeclarationList([
// 	// 			ts.factory.createVariableDeclaration(
// 	// 				"style", 
// 	// 				undefined, 
// 	// 				undefined,
// 	//				
// 	// 		])
// 	// 	), ...node.statements
// 	// ])
// }