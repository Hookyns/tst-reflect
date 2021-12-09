import { TypeKind }                 from "tst-reflect";
import * as ts                      from "typescript";
import {
	ConditionalType,
	SyntaxKind
}                                   from "typescript";
import { Context }                  from "./contexts/Context";
import { TypePropertiesSource }     from "./declarations";
import { getConstructors }          from "./getConstructors";
import { getDecorators }            from "./getDecorators";
import getLiteralName               from "./getLiteralName";
import { getNativeTypeDescription } from "./getNativeTypeDescription";
import { getNodeLocationText }      from "./getNodeLocationText";
import { getProperties }            from "./getProperties";
import getTypeCall                  from "./getTypeCall";
import {
	createCtorGetter,
	getType,
	getTypeFullName,
	getTypeKind
}                                   from "./helpers";
import { log }                      from "./log";

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
	typeCtor?: ts.EntityName | ts.DeclarationName
)
	: TypePropertiesSource
{
	if (context.config.debugMode && symbol?.declarations)
	{
		log.trace(getNodeLocationText(symbol.declarations[0]));
	}

	const nativeTypeDescriptionResult = getNativeTypeDescription(type, context);

	if (nativeTypeDescriptionResult.ok)
	{
		return nativeTypeDescriptionResult.typeDescription;
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
			if (context.config.debugMode)
			{
				log.info("Symbol is TypeLiteral of Object type.");
			}

			const declaration = symbol.declarations?.[0];

			if (declaration && ts.isTypeLiteralNode(declaration) && type.aliasSymbol)
			{
				return {
					k: TypeKind.Object,
					n: type.aliasSymbol.name,
					fn: getTypeFullName(type.aliasSymbol),
					props: getProperties(symbol, type, context)
				};
			}

			return {
				k: TypeKind.Object,
				props: getProperties(symbol, type, context)
			};
		}

		if (symbol.valueDeclaration && (
			ts.isPropertyDeclaration(symbol.valueDeclaration)
			|| ts.isPropertySignature(symbol.valueDeclaration)
			|| ts.isVariableDeclaration(symbol.valueDeclaration)
			|| ts.isParameter(symbol.valueDeclaration)
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
					};
				}

				let isUnion, isIntersection = false;

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
					};
				}
			}
		}
	}

	if (!typeSymbol)
	{
		if (context.config.debugMode)
		{
			log.info("'typeSymbol' is undefined.");
		}

		if ((type.flags & ts.TypeFlags.Object) == ts.TypeFlags.Object)
		{
			if (context.config.debugMode)
			{
				log.info("Symbol is TypeLiteral of Object type.");
			}

			return {
				k: TypeKind.Object,
				props: getProperties(symbol, type, context)
			};
		}
		else if ((type.flags & ts.TypeFlags.Conditional) == ts.TypeFlags.Conditional)
		{
			const ct = (type as ConditionalType).root.node;
			const extendsType = checker.getTypeAtLocation(ct.extendsType);
			const trueType = checker.getTypeAtLocation(ct.trueType);

			return {
				k: TypeKind.ConditionalType,
				ct: {
					e: getTypeCall(extendsType, extendsType.symbol, context),
					tt: getTypeCall(trueType, trueType.symbol, context),
					ft: getTypeCall(checker.getTypeAtLocation(ct.falseType), checker.getSymbolAtLocation(ct.falseType), context)
				}
			};
		}

		throw new Error("Unable to resolve type's symbol.");
	}
	else if ((type.flags & ts.TypeFlags.Object) == ts.TypeFlags.Object && (typeSymbol.flags & ts.SymbolFlags.TypeLiteral) == ts.SymbolFlags.TypeLiteral)
	{
		if (context.config.debugMode)
		{
			log.info("'typeSymbol' is TypeLiteral.");
		}

		return {
			k: TypeKind.Object,
			props: getProperties(typeSymbol, type, context)
		};
	}
	// Some object literal type, eg. `private foo: { a: string, b: number };`
	else if ((type.flags & ts.TypeFlags.Object) == ts.TypeFlags.Object && (typeSymbol.flags & ts.SymbolFlags.ObjectLiteral) == ts.SymbolFlags.ObjectLiteral)
	{
		if (context.config.debugMode)
		{
			log.info("'typeSymbol' is ObjectLiteral.");
		}

		return {
			k: TypeKind.Object,
			props: getProperties(typeSymbol, type, context)
		};
	}
	else if ((type.flags & ts.TypeFlags.TypeParameter) == ts.TypeFlags.TypeParameter && (typeSymbol.flags & ts.SymbolFlags.TypeParameter) == ts.SymbolFlags.TypeParameter)
	{
		if (context.config.debugMode)
		{
			log.info("'typeSymbol' is TypeParameter.");
		}

		if (typeSymbol.declarations)
		{
			const typeParameter = typeSymbol.declarations[0];

			if (ts.isTypeParameterDeclaration(typeParameter))
			{
				return {
					k: TypeKind.TypeParameter,
					n: typeParameter.name.escapedText as string,
					con: typeParameter.constraint && getTypeCall(
						checker.getTypeAtLocation(typeParameter.constraint),
						checker.getSymbolAtLocation(typeParameter.constraint),
						context
					) || undefined,
					def: typeParameter.default && getTypeCall(
						checker.getTypeAtLocation(typeParameter.default),
						checker.getSymbolAtLocation(typeParameter.default),
						context
					) || undefined
				};
			}
		}

		throw new Error("Unable to resolve TypeParameter's declaration.");
	}

	const decorators = getDecorators(typeSymbol, checker);
	const kind = getTypeKind(typeSymbol);
	const symbolType = getType(typeSymbol, checker);

	const properties: TypePropertiesSource = {
		n: typeSymbol.getName(),
		fn: getTypeFullName(typeSymbol || type.getSymbol()),
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

	const declaration = typeSymbol.declarations?.[0];

	if (declaration && (
		ts.isClassDeclaration(declaration) || ts.isInterfaceDeclaration(declaration)
	))
	{
		// extends & implements
		if (declaration.heritageClauses)
		{
			const ext = declaration.heritageClauses.filter(h => h.token == ts.SyntaxKind.ExtendsKeyword)[0];

			if (ext)
			{
				properties.bt = getTypeCall(
					checker.getTypeAtLocation(ext.types[0]),
					checker.getSymbolAtLocation(ext.types[0]),
					context
				);
			}

			const impl = declaration.heritageClauses.filter(h => h.token == ts.SyntaxKind.ImplementsKeyword)[0];

			if (impl)
			{
				properties.iface = getTypeCall(
					checker.getTypeAtLocation(impl.types[0]),
					checker.getSymbolAtLocation(impl.types[0]),
					context
				);
			}
		}

		// Type parameters
		if (declaration.typeParameters)
		{
			properties.tp = declaration.typeParameters.map(typeParameterDeclaration => getTypeCall(
				checker.getTypeAtLocation(typeParameterDeclaration),
				checker.getSymbolAtLocation(typeParameterDeclaration),
				context
			));
		}
	}

	return properties;
}