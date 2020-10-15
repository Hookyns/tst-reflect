import * as ts                                                 from "typescript";
import {TypeKind}                                              from "tst-reflect";
import {GetTypeCall, SourceFileContext, TypePropertiesSource}  from "./declarations";
import {getSymbol, getTypeFullName, getTypeKind, isNativeType} from "./helpers";
import {createValueExpression}                                 from "./createValueExpression";
import {getProperties}                                         from "./getProperties";
import {getDecorators}                                         from "./getDecorators";
import {getConstructors}                                       from "./getConstructors";

const createdTypes: Map<number, ts.ObjectLiteralExpression> = new Map<number, ts.ObjectLiteralExpression>();

function createTypeGetter(typeCtor: ts.EntityName | undefined)
{
	if (!typeCtor)
	{
		return undefined;
	}

	return ts.factory.createArrowFunction(undefined, undefined, [], undefined, ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken), typeCtor as ts.Expression);
}

function getTypeProperties(symbol: ts.Symbol | undefined, type: ts.Type, checker: ts.TypeChecker, sourceFileContext: SourceFileContext, typeCtor?: ts.EntityName): TypePropertiesSource
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
				.map(typeNode => getTypeCall(
					getSymbol(typeNode, checker),
					checker.getTypeAtLocation(typeNode),
					checker,
					sourceFileContext
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

	const decorators = getDecorators(typeSymbol, checker);
	const kind = getTypeKind(typeSymbol);

	return {
		n: typeSymbol.getName(),
		fn: getTypeFullName(type, typeSymbol),
		props: getProperties(symbol, checker, sourceFileContext),
		ctors: getConstructors(type, checker, sourceFileContext),
		decs: decorators,
		k: kind,
		ctor: kind == TypeKind.Class ? createTypeGetter(typeCtor) : undefined
	};
}

export default function getTypeCall(symbol: ts.Symbol | undefined, type: ts.Type, checker: ts.TypeChecker, sourceFileContext: SourceFileContext, typeCtor?: ts.EntityName): GetTypeCall
{
	const id: number | undefined = (type.symbol as any)?.["id"];
	let typePropertiesObjectLiteral: ts.ObjectLiteralExpression | undefined = undefined;

	try
	{
		if (id)
		{
			typePropertiesObjectLiteral = createdTypes.get(id);
		}

		if (!typePropertiesObjectLiteral)
		{
			const props = getTypeProperties(symbol, type, checker, sourceFileContext, typeCtor);
			typePropertiesObjectLiteral = createValueExpression(props) as ts.ObjectLiteralExpression;
		}

		if (id && sourceFileContext)
		{
			sourceFileContext.typesProperties[id] = typePropertiesObjectLiteral;

			// Just call getType() with typeId; Type is gonna be take from storage
			return ts.factory.createCallExpression(sourceFileContext?.getTypeIdentifier!, [], [ts.factory.createNumericLiteral(id)]);
		}

		// Type is not registered (no Id or no sourceFileContext) so direct type construction returned
		return ts.factory.createCallExpression(sourceFileContext?.getTypeIdentifier!, [], [typePropertiesObjectLiteral]);
	}
	catch (ex)
	{
		console.error(ex);
		throw ex;
	}
}