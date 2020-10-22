import * as ts                                               from "typescript";
import {TypeKind}                                            from "tst-reflect";
import {SourceFileContext, TypePropertiesSource}             from "./declarations";
import {getType, getTypeFullName, getTypeKind, isNativeType} from "./helpers";
import {getDecorators}                                       from "./getDecorators";
import {getProperties}                                       from "./getProperties";
import {getConstructors}                                     from "./getConstructors";
import getTypeCall                                           from "./getTypeCall";

/**
 * Return getter (arrow function/lambda) for runtime type's Ctor.
 * @description Arrow function generated cuz of possible "Type is referenced before declaration".
 */
function createCtorGetter(typeCtor: ts.EntityName | undefined)
{
	if (!typeCtor)
	{
		return undefined;
	}

	return ts.factory.createArrowFunction(undefined, undefined, [], undefined, ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken), typeCtor as ts.Expression);
}

/**
 * Return TypePropertiesSource object describing given type
 * @param symbol
 * @param type
 * @param checker
 * @param sourceFileContext
 * @param typeCtor
 */
export function getTypeDescription(
	symbol: ts.Symbol | undefined,
	type: ts.Type,
	checker: ts.TypeChecker,
	sourceFileContext: SourceFileContext,
	typeCtor?: ts.EntityName
)
	: TypePropertiesSource
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
		ts.isPropertyDeclaration(symbol.valueDeclaration) || ts.isPropertySignature(symbol.valueDeclaration) || ts.isVariableDeclaration(symbol.valueDeclaration)
	))
	{
		let isUnion = false, isIntersection = false;

		if (symbol.valueDeclaration.type && (
			(isUnion = ts.isUnionTypeNode(symbol.valueDeclaration.type)) || (isIntersection = ts.isIntersectionTypeNode(symbol.valueDeclaration.type))
		))
		{
			const types = symbol.valueDeclaration.type.types
				.map(typeNode => getTypeCall(
					checker.getSymbolAtLocation(typeNode),
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

	let typeSymbol = type.getSymbol();

	if (!typeSymbol)
	{
		throw new Error("Unable to resolve type's symbol.");
	}

	const decorators = getDecorators(typeSymbol, checker);
	const kind = getTypeKind(typeSymbol);
	const symbolType = getType(typeSymbol, checker);

	const properties: TypePropertiesSource = {
		n: typeSymbol.getName(),
		fn: getTypeFullName(type, typeSymbol),
		props: getProperties(symbol, checker, sourceFileContext),
		ctors: getConstructors(symbolType, checker, sourceFileContext),
		decs: decorators,
		k: kind,
		ctor: kind == TypeKind.Class ? createCtorGetter(typeCtor) : undefined,
		// bt: , // TODO: 
		// iface: 
	};

	if (kind == TypeKind.Class)
	{
		properties.ctor = createCtorGetter(typeCtor)
	}

	const declaration = typeSymbol.declarations[0];

	if (ts.isClassDeclaration(declaration) || ts.isInterfaceDeclaration(declaration))
	{
		if (declaration.heritageClauses)
		{
			const ext = declaration.heritageClauses.filter(h => h.token == ts.SyntaxKind.ExtendsKeyword)[0];
			const impl = declaration.heritageClauses.filter(h => h.token == ts.SyntaxKind.ImplementsKeyword)[0];

			if (ext)
			{
				properties.bt = getTypeCall(
					checker.getSymbolAtLocation(ext.types[0]),
					checker.getTypeAtLocation(ext.types[0]),
					checker,
					sourceFileContext
				);
			}
			else if (impl)
			{
				properties.iface = getTypeCall(
					checker.getSymbolAtLocation(impl.types[0]),
					checker.getTypeAtLocation(impl.types[0]),
					checker,
					sourceFileContext
				);
			}
		}
	}

	return properties;
}