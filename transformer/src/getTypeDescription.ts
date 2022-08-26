import { TypeKind }                 from "tst-reflect";
import * as ts                      from "typescript";
import { MetadataTypeValues }       from "./config-options";
import { Context }                  from "./contexts/Context";
import {
	GetTypeCall,
	TypeDescription,
	TypePropertiesSource
}                                   from "./declarations";
import { getConstructors }          from "./getConstructors";
import { getDecorators }            from "./getDecorators";
import { getExportOfConstructor }   from "./getExports";
import { getIndexes }               from "./getIndexes";
import getLiteralName               from "./getLiteralName";
import {
	getMethodGenerics,
	getMethods
}                                   from "./getMethods";
import { getNativeTypeDescription } from "./getNativeTypeDescription";
import { getNodeLocationText }      from "./getNodeLocationText";
import { getProperties }            from "./getProperties";
import { getSignatureParameters }   from "./getSignatureParameters";
import { getTypeCall }              from "./getTypeCall";
import {
	createCtorPromise,
	getBooleanTypeCall,
	getDeclaration,
	getFunctionLikeSignature,
	getType,
	getTypeFullName,
	getTypeKind,
	getUnknownTypeCall,
	simplifyUnionWithTrueFalse,
	UNKNOWN_TYPE_PROPERTIES
} from "./helpers";
import { log }                      from "./log";
import { nodeGenerator }            from "./NodeGenerator";

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
	: TypeDescription
{
	if (context.config.debugMode && symbol?.declarations)
	{
		log.trace(getNodeLocationText(symbol.declarations[0]));
	}

	const nativeTypeDescriptionResult = getNativeTypeDescription(type, context);

	if (nativeTypeDescriptionResult.ok)
	{
		return {
			properties: nativeTypeDescriptionResult.typeDescription,
			localType: false
		};
	}

	let typeSymbol = type.getSymbol();

	if (type.aliasSymbol)
	{
		symbol = type.aliasSymbol;
	}

	if (!symbol && typeSymbol)
	{
		symbol = typeSymbol;
	}

	if (type.isUnion() && (type.flags & ts.TypeFlags.EnumLiteral) == ts.TypeFlags.EnumLiteral)
	{
		return {
			properties: {
				k: TypeKind.Enum,
				n: symbol?.escapedName.toString(),
				types: type.types.map(type => getTypeCall(type, undefined, context)),
			},
			localType: false
		};
	}

	if ((type.flags & ts.TypeFlags.Literal) != 0)
	{
		return {
			properties: {
				k: TypeKind.LiteralType,
				n: getLiteralName(type),
				v: (type as any).value,
			},
			localType: false
		};
	}

	const checker = context.typeChecker;

	if (type.isUnionOrIntersection())
	{
		let types: Array<GetTypeCall>;

		if (type.isUnion())
		{
			types = simplifyUnionWithTrueFalse(type, context);
		}
		else
		{
			types = (type as ts.IntersectionType).types
				.map(childType => getTypeCall(
						childType,
						undefined,
						context
					)
				);
		}

		return {
			properties: {
				n: symbol?.escapedName.toString(),
				k: TypeKind.Container,
				types: types,
				union: type.isUnion(),
				inter: type.isIntersection()
			},
			localType: false
		};
	}

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
					properties: {
						k: TypeKind.Object,
						n: type.aliasSymbol.name,
						fn: getTypeFullName(type, context),
						props: getProperties(symbol, type, context),
						indxs: getIndexes(type, context)
					},
					localType: false
				};
			}

			return {
				properties: {
					k: TypeKind.Object,
					props: getProperties(symbol, type, context),
					indxs: getIndexes(type, context)
				},
				localType: false
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
						properties: {
							k: TypeKind.TransientTypeReference,
							n: (symbol.valueDeclaration.type.typeName as any).escapedText,
							args: symbol.valueDeclaration.type.typeArguments?.map(typeNode => getTypeCall(
									checker.getTypeAtLocation(typeNode),
									checker.getSymbolAtLocation(typeNode),
									context
								)
							) || [],
						},
						localType: false
					};
				}

				// TODO: Review this union & intersection. There is Union & Intersection handled on line ~86
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
						properties: {
							n: symbol.escapedName.toString(),
							k: TypeKind.Container,
							types: types,
							union: isUnion,
							inter: isIntersection
						},
						localType: false
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

		if (type.flags & ts.TypeFlags.Object)
		{
			if (context.config.debugMode)
			{
				log.info("Symbol is TypeLiteral of Object type.");
			}

			return {
				properties: {
					k: TypeKind.Object,
					props: getProperties(symbol, type, context),
					indxs: getIndexes(type, context)
				},
				localType: false
			};
		}
		else if ((type.flags & ts.TypeFlags.Conditional) == ts.TypeFlags.Conditional)
		{
			const ct = (type as ts.ConditionalType).root.node;
			const extendsType = checker.getTypeAtLocation(ct.extendsType);
			const trueType = checker.getTypeAtLocation(ct.trueType);

			return {
				properties: {
					k: TypeKind.ConditionalType,
					ct: {
						e: getTypeCall(extendsType, extendsType.symbol, context),
						tt: getTypeCall(trueType, trueType.symbol, context),
						ft: getTypeCall(checker.getTypeAtLocation(ct.falseType), checker.getSymbolAtLocation(ct.falseType), context)
					}
				},
				localType: false
			};
		}
		else if ((type.flags & ts.TypeFlags.IndexedAccess) == ts.TypeFlags.IndexedAccess)
		{
			const indexedAccess = type as ts.IndexedAccessType;

			return {
				properties: {
					k: TypeKind.IndexedAccess,
					iat: {
						ot: getTypeCall(indexedAccess.objectType, indexedAccess.objectType.symbol, context),
						it: getTypeCall(indexedAccess.indexType, indexedAccess.indexType.symbol, context)
					}
				},
				localType: false
			};
		}

		// throw new Error("Unable to resolve type's symbol.");
		log.warn("Unable to resolve type's symbol. Returning type Unknown.");
		return { properties: UNKNOWN_TYPE_PROPERTIES, localType: false };
	}
	else if ((type.flags & ts.TypeFlags.Object) == ts.TypeFlags.Object && (typeSymbol.flags & ts.SymbolFlags.TypeLiteral) == ts.SymbolFlags.TypeLiteral)
	{
		if (context.config.debugMode)
		{
			log.info("'typeSymbol' is TypeLiteral.");
		}

		return {
			properties: {
				n: type.aliasSymbol?.name.toString(),
				k: TypeKind.Object,
				props: getProperties(typeSymbol, type, context),
				indxs: getIndexes(type, context)
			},
			localType: false
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
			properties: {
				k: TypeKind.Object,
				props: getProperties(typeSymbol, type, context),
				indxs: getIndexes(type, context)
			},
			localType: false
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
					properties: {
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
					},
					localType: false
				};
			}
		}

		context.log.warn("Unable to resolve TypeParameter's declaration.");
		return { properties: UNKNOWN_TYPE_PROPERTIES, localType: false };
	}
	else if ((typeSymbol.flags & ts.SymbolFlags.Function) !== 0)
	{
		const functionSignature = getFunctionLikeSignature(typeSymbol, undefined, context.typeChecker);
		const returnType = functionSignature?.getReturnType();

		return {
			properties: {
				k: TypeKind.Function,
				n: typeSymbol.getName(),
				fn: getTypeFullName(type, context),
				fnc: {
					params: functionSignature && getSignatureParameters(functionSignature, context),
					rt: returnType && getTypeCall(returnType, returnType.symbol, context) || getUnknownTypeCall(context),
					tp: getMethodGenerics(typeSymbol, context)
				}
			},
			localType: false
		};
	}

	const kind = getTypeKind(typeSymbol);

	if (kind == null)
	{
		return { properties: UNKNOWN_TYPE_PROPERTIES, localType: false };
	}

	const decorators = getDecorators(typeSymbol, context);
	const symbolToUse = typeSymbol || symbol;

	let localType = false;

	const typeArgs = context.typeChecker.getTypeArguments(type as ts.TypeReference);
	const isGenericType = (((type as ts.ObjectType).objectFlags ?? 0) & ts.ObjectFlags.Reference) !== 0 && typeArgs.length !== 0;

	const properties: TypePropertiesSource = {
		k: kind,
		isg: isGenericType,
		gtd: isGenericType && type !== (type as ts.GenericType).target ? getTypeCall((type as ts.GenericType).target, undefined, context, typeCtor) : undefined,
		n: typeSymbol.getName(),
		fn: getTypeFullName(type, context),
		props: getProperties(symbolToUse, type, context),
		indxs: getIndexes(type, context),
		meths: getMethods(symbolToUse, type, context),
		decs: decorators,
		args: typeArgs.map(t => getTypeCall(t, undefined, context))
	};

	if (kind === TypeKind.Class)
	{
		const symbolType = getType(typeSymbol, checker);

		if (symbolType === undefined)
		{
			const declaration = getDeclaration(symbolType);
			context.log.warn("Unable to resolve ts.Type of the symbol." + (declaration === undefined ? "" : " At " + getNodeLocationText(declaration)));
		}
		else
		{
			properties.ctors = getConstructors(symbolType, context);
		}

		if (typeCtor)
		{
			const constructorExport = getExportOfConstructor(typeSymbol, typeCtor, context);

			if (constructorExport)
			{
				if (context.config.isServerMode())
				{
					properties.ctorDesc = nodeGenerator.createObjectLiteralExpressionNode(constructorExport);
				}

				const [ctorGetter, ctorRequireCall] = createCtorPromise(typeCtor, constructorExport, context);

				if (ctorGetter)
				{
					properties.ctor = ctorGetter;

					// TODO: Review. TypeCtors seems unused.
					if (ctorRequireCall)
					{
						context.addTypeCtor(ctorRequireCall);
					}
				}
			}
			// If it is not exported, it must be getType<> of local class; in that case, we have direct access to class. But this type info must be generated in file.
			else
			{
				localType = true;

				let expression = typeCtor as ts.Expression;

				// In "typelib" mode we have to use typeof() to ensure there will be no error after getting ctor, 
				// because Identifier will be undefined in typelib file
				if (context.config.useMetadataType == MetadataTypeValues.typeLib)
				{
					expression = ts.factory.createConditionalExpression(
						ts.factory.createBinaryExpression(
							ts.factory.createTypeOfExpression(expression),
							ts.factory.createToken(ts.SyntaxKind.EqualsEqualsToken),
							ts.factory.createStringLiteral("function")
						),
						ts.factory.createToken(ts.SyntaxKind.QuestionToken),
						expression,
						ts.factory.createToken(ts.SyntaxKind.ColonToken),
						ts.factory.createIdentifier("undefined")
					);
				}

				// function() { return Promise.resolve(TypeCtor) }
				properties.ctor = ts.factory.createFunctionExpression(
					undefined,
					undefined,
					undefined,
					undefined,
					[],
					undefined,
					ts.factory.createBlock([
						ts.factory.createReturnStatement(
							ts.factory.createCallExpression(
								ts.factory.createPropertyAccessExpression(
									ts.factory.createIdentifier("Promise"),
									ts.factory.createIdentifier("resolve")
								),
								undefined,
								[
									expression
								]
							)
						)
					], true)
				);
			}

		}
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

	return {
		properties: properties,
		localType: localType
	};
}
