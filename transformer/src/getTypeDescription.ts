import * as ts                                               from "typescript";
import {TypeKind}                                            from "tst-reflect";
import {TypePropertiesSource}                                from "./declarations";
import {getType, getTypeFullName, getTypeKind, isNativeType} from "./helpers";
import {getDecorators}                                       from "./getDecorators";
import {getProperties}                                       from "./getProperties";
import {getConstructors}                                     from "./getConstructors";
import getTypeCall                                           from "./getTypeCall";
import getLiteralName                                        from "./getLiteralName";
import {Context}                                             from "./contexts/Context";

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
 * @param context
 * @param typeCtor
 */
export function getTypeDescription(
	type: ts.Type,
	symbol: ts.Symbol | undefined,
	context: Context,
	typeCtor?: ts.EntityName
)
	: TypePropertiesSource
{
	if (isNativeType(type))
	{
		return {
			n: (type as any).intrinsicName,
			k: TypeKind.Native,
			ctors: undefined,
			decs: undefined,
			props: undefined
		};
	}

	if ((type.flags & ts.TypeFlags.Literal) != 0)
	{
		return {
			k: TypeKind.LiteralType,
			n: getLiteralName(type),
			v: (type as any).value,
		};
	}

	let typeSymbol = type.getSymbol();

	if (!symbol && typeSymbol)
	{
		symbol = typeSymbol;
	}

	const checker = context.typeChecker;

	if (symbol)
	{
		if (symbol.flags == ts.SymbolFlags.TypeLiteral && type.flags == ts.TypeFlags.Object)
		{
			return {
				k: TypeKind.Object,
				props: getProperties(symbol, type, context)
			};
		}

		if (symbol.valueDeclaration && (
			ts.isPropertyDeclaration(symbol.valueDeclaration)
			|| ts.isPropertySignature(symbol.valueDeclaration)
			|| ts.isVariableDeclaration(symbol.valueDeclaration)
		))
		{
			if (symbol.valueDeclaration.type)
			{
				if (ts.isTypeReferenceNode(symbol.valueDeclaration.type)
					&& typeSymbol && (typeSymbol.flags & ts.SymbolFlags.Transient) == ts.SymbolFlags.Transient)
				{
					return {
						k: TypeKind.TransientTypeReference,
						n: (symbol.valueDeclaration.type.typeName as any).escapedText,
						args: symbol.valueDeclaration.type.typeArguments?.map(typeNode => getTypeCall(
							checker.getTypeAtLocation(typeNode),
							checker.getSymbolAtLocation(typeNode),
							context
							)
						) || [],
					}
				}

				let isUnion = false, isIntersection = false

				if (
					(isUnion = ts.isUnionTypeNode(symbol.valueDeclaration.type))
					|| (isIntersection = ts.isIntersectionTypeNode(symbol.valueDeclaration.type))
				)
				{
					const types = symbol.valueDeclaration.type.types
						.map(typeNode => getTypeCall(
							checker.getTypeAtLocation(typeNode),
							checker.getSymbolAtLocation(typeNode),
							context
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
		}
	}

	if (!typeSymbol)
	{
		if (type.flags == ts.TypeFlags.Object)
		{
			return {
				k: TypeKind.Object,
				props: getProperties(symbol, type, context)
			};
		}

		throw new Error("Unable to resolve type's symbol.");
	}

	const decorators = getDecorators(typeSymbol, checker);
	const kind = getTypeKind(typeSymbol);
	const symbolType = getType(typeSymbol, checker);

	const properties: TypePropertiesSource = {
		n: typeSymbol.getName(),
		fn: getTypeFullName(type, typeSymbol),
		props: getProperties(symbol, type, context),
		ctors: getConstructors(symbolType, context),
		decs: decorators,
		k: kind,
		ctor: kind == TypeKind.Class ? createCtorGetter(typeCtor) : undefined
	};

	if (kind == TypeKind.Class && typeCtor)
	{
		context.addTypeCtor(typeCtor);
	}

	const declaration = typeSymbol.declarations[0];

	if (ts.isClassDeclaration(declaration) || ts.isInterfaceDeclaration(declaration))
	{
		// extends & implements
		if (declaration.heritageClauses)
		{
			const ext = declaration.heritageClauses.filter(h => h.token == ts.SyntaxKind.ExtendsKeyword)[0];
			const impl = declaration.heritageClauses.filter(h => h.token == ts.SyntaxKind.ImplementsKeyword)[0];

			if (ext)
			{
				properties.bt = getTypeCall(
					checker.getTypeAtLocation(ext.types[0]),
					checker.getSymbolAtLocation(ext.types[0]),
					context
				);
			}
			else if (impl)
			{
				properties.iface = getTypeCall(
					checker.getTypeAtLocation(impl.types[0]),
					checker.getSymbolAtLocation(impl.types[0]),
					context
				);
			}
		}
	}

	return properties;
}