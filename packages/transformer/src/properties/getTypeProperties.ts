import { TypeKind }                   from "@rtti/abstract";
import * as ts                        from "typescript";
import { MetadataTypeValues }         from "../config-options";
import { Context }                    from "../contexts/Context";
import {
	TypeProperties,
	UnknownTypeProperties,
	UnknownTypeReference
}                                     from "../declarations";
import { getTypeNodeIdentifier }      from "../utils/getTypeNodeIdentifier";
import { getDeclaration }             from "../utils/symbolHelpers";
import { getConstructors }            from "./getConstructors";
import { getDecorators }              from "../getDecorators";
import { log }                        from "../log";
import { getMethods }                 from "./getMethods";
import { getPrimitiveTypeProperties } from "./getPrimitiveTypeProperties";
import { getLiteralProperties }       from "./getLiteralProperties";
import { getNodeLocationText }        from "../utils/getNodeLocationText";
import {
	getTypeFullName,
	getTypeId
}                                     from "../utils/typeHelpers";
import { getProperties }              from "./getProperties";

type TypeMapperResult = TypeProperties | undefined;
type TypeMapper = (type: ts.Type, typeNode: ts.TypeNode, context: Context) => TypeMapperResult;

const ObjectFlagsMappers: { [typeFlag: number]: TypeMapper } = {
	[ts.ObjectFlags.Tuple]: mapTuple as TypeMapper,
	[ts.ObjectFlags.ObjectLiteral]: mapObjectLiteral as TypeMapper,
	[ts.ObjectFlags.Anonymous]: mapObjectLiteral as TypeMapper,
};

const TypeFlagsMappers: { [typeFlag: number]: TypeMapper } = {
	[ts.TypeFlags.Enum]: mapEnum,
	[ts.TypeFlags.EnumLiteral]: mapEnumLiteral as TypeMapper,
	[ts.TypeFlags.ESSymbol]: mapESSymbol,
	[ts.TypeFlags.UniqueESSymbol]: mapUniqueEESymbol as TypeMapper,
	[ts.TypeFlags.TypeParameter]: mapTypeParameter,
	[ts.TypeFlags.Object]: mapObject as TypeMapper,
	[ts.TypeFlags.Union]: mapUnion as TypeMapper,
	[ts.TypeFlags.Intersection]: mapIntersection as TypeMapper,
	[ts.TypeFlags.Index]: mapIndex as TypeMapper,
	[ts.TypeFlags.IndexedAccess]: mapIndexedAccessType as TypeMapper,
	[ts.TypeFlags.Conditional]: mapConditional as TypeMapper,
	[ts.TypeFlags.TemplateLiteral]: mapTemplateLiteral as TypeMapper,
};


/**
 * Return TypeProperties object describing given type.
 * @param context
 * @param typeNode
 * @param type
 */
export function getTypeProperties(context: Context, typeNode: ts.TypeNode, type: ts.Type): TypeProperties
{
	if (context.config.debugMode && typeNode)
	{
		log.trace(getNodeLocationText(typeNode));
	}

	const primitiveTypeProperties = getPrimitiveTypeProperties(context, typeNode, type);

	if (primitiveTypeProperties !== undefined)
	{
		return primitiveTypeProperties;
	}

	const literalDescriptionResult = getLiteralProperties(context, typeNode, type);

	if (literalDescriptionResult !== undefined)
	{
		return literalDescriptionResult;
	}

	const mapper = TypeFlagsMappers[type.flags];

	if (mapper === undefined)
	{
		context.log.warn("Unhandled type kind " + type.flags + "\r\n\t" + getNodeLocationText(typeNode));
		return UnknownTypeProperties;
	}

	const mapperResult = mapper(type, typeNode, context);

	if (mapperResult)
	{
		return mapperResult;
	}

	context.log.warn("Unhandled type kind " + type.flags);


	let symbol = undefined;
	let typeSymbol = type.getSymbol();

	if (type.aliasSymbol)
	{
		symbol = type.aliasSymbol;
	}

	if (!symbol && typeSymbol)
	{
		symbol = typeSymbol;
	}

	// if (type.isUnion() && (type.flags & ts.TypeFlags.EnumLiteral) == ts.TypeFlags.EnumLiteral)
	// {
	// 	return {
	// 		properties: {
	// 			k: TypeKind.Enum,
	// 			n: symbol?.escapedName.toString(),
	// 			types: type.types.map(type => getTypeCall(type, undefined, context)),
	// 		},
	// 		localType: false
	// 	};
	// }

	// if ((type.flags & ts.TypeFlags.Literal) != 0)
	// {
	// 	return {
	// 		properties: getLiteralProperties(type),
	// 		localType: false
	// 	};
	// }

	const checker = context.typeChecker;

	// if (type.isUnionOrIntersection())
	// {
	// 	const types = type.types
	// 		.map(childType => getTypeCall(
	// 				childType,
	// 				undefined, //checker.getSymbolAtLocation(typeNode),
	// 				context
	// 			)
	// 		);
	//
	// 	return {
	// 		properties: {
	// 			n: symbol?.escapedName.toString(),
	// 			k: type.isUnion() ? TypeKind.Union : TypeKind.Intersection,
	// 			types: types
	// 		},
	// 		localType: false
	// 	};
	// }

	// function isObjectType(type: ts.Type): type is ts.ObjectType
	// {
	// 	return !!(type.flags & ts.TypeFlags.Object);
	// }
	//
	// function isTypeReference(type: ts.Type): type is ts.TypeReference
	// {
	// 	return isObjectType(type) && !!(type.objectFlags & ts.ObjectFlags.Reference);
	// }
	//
	// function isTupleType(type: ts.Type): type is ts.TupleType
	// {
	// 	return isObjectType(type) && !!(type.objectFlags & ts.ObjectFlags.Tuple);
	// }
	//
	// function isTupleTypeWithDeclaredMembers(type: ts.Type): type is ts.TupleType & ts.InterfaceTypeWithDeclaredMembers
	// {
	// 	return isTupleType(type) && !!(type as unknown as ts.InterfaceTypeWithDeclaredMembers).declaredProperties;
	// }
	//
	// if (isTypeReference(type))
	// {
	// 	if (isTupleType(type.target))
	// 	{
	// 		const symbol = type.aliasSymbol || type.symbol;
	//
	// 		if (type.target.labeledElementDeclarations)
	// 		{
	// 			// TODO: labeled
	// 		}
	//
	// 		return {
	// 			properties: {
	// 				k: TypeKind.Tuple,
	// 				n: symbol?.name,
	// 				fn: getTypeFullName(symbol),
	// 				props: type.typeArguments?.map((propType, i) => ({ n: i.toString(), t: getTypeCall(propType, undefined, context, getCtorTypeReference(propType.symbol)) }))
	// 			},
	// 			localType: false
	// 		};
	// 	}
	// }

	if (symbol)
	{
		if (symbol.flags == ts.SymbolFlags.TypeLiteral && type.flags == ts.TypeFlags.Object) // TODO: CHeck what is in type.objectFlags!
		{
			if (context.config.debugMode)
			{
				log.info("Symbol is TypeLiteral of Object type.");
			}

			const declaration = symbol.declarations?.[0];

			if (declaration && ts.isTypeLiteralNode(declaration) && type.aliasSymbol)
			{
				const x = {
					kind: TypeKind.Object,
					name: type.aliasSymbol.name,
					fullName: getTypeFullName(type, context),
					properties: getProperties(context, type)
				};

				return UnknownTypeProperties;
			}

			const x = {
				kind: TypeKind.Object,
				properties: getProperties(context, type)
			};

			return UnknownTypeProperties;
		}

		if (symbol.valueDeclaration && (
			ts.isPropertyDeclaration(symbol.valueDeclaration)
			|| ts.isPropertySignature(symbol.valueDeclaration)
			|| ts.isVariableDeclaration(symbol.valueDeclaration)
			|| ts.isParameter(symbol.valueDeclaration)
		))
		{
			if (symbol.valueDeclaration.type) // TODO: Review. This whole section is bullshit!
			{
				if (ts.isTypeReferenceNode(symbol.valueDeclaration.type)
					&& typeSymbol && (typeSymbol.flags & ts.SymbolFlags.Transient) == ts.SymbolFlags.Transient)
				{
					const x = {
						kind: TypeKind.Object, //TypeKind.TransientTypeReference,
						name: (symbol.valueDeclaration.type.typeName as any).escapedText,
						arguments: symbol.valueDeclaration.type.typeArguments?.map(typeNode => context.metadata.addType(typeNode)

							// getTypeCall(
							// 	checker.getTypeAtLocation(typeNode),
							// 	checker.getSymbolAtLocation(typeNode),
							// 	context
							// )
						) || [],
					};

					return UnknownTypeProperties;
				}

				// TODO: Review this union & intersection. There is Union & Intersection handled on line ~86
				let isUnion, isIntersection = false;

				if (
					(isUnion = ts.isUnionTypeNode(symbol.valueDeclaration.type))
					|| (isIntersection = ts.isIntersectionTypeNode(symbol.valueDeclaration.type))
				)
				{
					throw new Error("DEBUG Union or intersection!"); // TODO: remove this; Unions and Intersections should be handled above
					// const types = symbol.valueDeclaration.type.types
					// 	.map(typeNode => getTypeCall(
					// 			checker.getTypeAtLocation(typeNode),
					// 			checker.getSymbolAtLocation(typeNode),
					// 			context
					// 		)
					// 	);
					//
					// return {
					// 	properties: {
					// 		n: symbol.escapedName.toString(),
					// 		k: isUnion ? TypeKind.Union : TypeKind.Intersection,
					// 		types: types
					// 	},
					// 	localType: false
					// };
				}
			}
		}
	}


	return UnknownTypeProperties;


	// if (!typeSymbol)
	// {
	// 	if (context.config.debugMode)
	// 	{
	// 		log.info("'typeSymbol' is undefined.");
	// 	}
	//
	// 	// if (type.flags & ts.TypeFlags.Object)
	// 	// {
	// 	// 	if (context.config.debugMode)
	// 	// 	{
	// 	// 		log.info("Symbol is TypeLiteral of Object type.");
	// 	// 	}
	// 	//
	// 	// 	return {
	// 	// 		properties: {
	// 	// 			k: TypeKind.Object,
	// 	// 			props: getProperties(symbol, type, context)
	// 	// 		},
	// 	// 		localType: false
	// 	// 	};
	// 	// }
	// 	// else if ((type.flags & ts.TypeFlags.Conditional) == ts.TypeFlags.Conditional)
	// 	// {
	// 	// 	const ct = (type as ts.ConditionalType).root.node;
	// 	// 	const extendsType = checker.getTypeAtLocation(ct.extendsType);
	// 	// 	const trueType = checker.getTypeAtLocation(ct.trueType);
	// 	//
	// 	// 	return {
	// 	// 		properties: {
	// 	// 			k: TypeKind.ConditionalType,
	// 	// 			ct: {
	// 	// 				e: getTypeCall(extendsType, extendsType.symbol, context),
	// 	// 				tt: getTypeCall(trueType, trueType.symbol, context),
	// 	// 				ft: getTypeCall(checker.getTypeAtLocation(ct.falseType), checker.getSymbolAtLocation(ct.falseType), context)
	// 	// 			}
	// 	// 		},
	// 	// 		localType: false
	// 	// 	};
	// 	// }
	// 	// else if ((type.flags & ts.TypeFlags.IndexedAccess) == ts.TypeFlags.IndexedAccess)
	// 	// {
	// 	// 	const indexedAccess = type as ts.IndexedAccessType;
	// 	//
	// 	// 	return {
	// 	// 		properties: {
	// 	// 			k: TypeKind.IndexedAccess,
	// 	// 			iat: {
	// 	// 				ot: getTypeCall(indexedAccess.objectType, indexedAccess.objectType.symbol, context),
	// 	// 				it: getTypeCall(indexedAccess.indexType, indexedAccess.indexType.symbol, context)
	// 	// 			}
	// 	// 		},
	// 	// 		localType: false
	// 	// 	};
	// 	// }
	//
	// 	log.error("Unable to resolve type's symbol. Returning type Unknown.");
	// 	return { properties: UNKNOWN_TYPE_PROPERTIES, localType: false };
	// }
	// else if ((type.flags & ts.TypeFlags.Object) == ts.TypeFlags.Object && (typeSymbol.flags & ts.SymbolFlags.TypeLiteral) == ts.SymbolFlags.TypeLiteral)
	// {
	// 	if (context.config.debugMode)
	// 	{
	// 		log.info("'typeSymbol' is TypeLiteral.");
	// 	}
	//
	// 	return {
	// 		properties: {
	// 			n: type.aliasSymbol?.name.toString(),
	// 			k: TypeKind.Object,
	// 			props: getProperties(typeSymbol, type, context)
	// 		},
	// 		localType: false
	// 	};
	// }
	// // Some object literal type, eg. `private foo: { a: string, b: number };`
	// else if ((type.flags & ts.TypeFlags.Object) == ts.TypeFlags.Object && (typeSymbol.flags & ts.SymbolFlags.ObjectLiteral) == ts.SymbolFlags.ObjectLiteral)
	// {
	// 	if (context.config.debugMode)
	// 	{
	// 		log.info("'typeSymbol' is ObjectLiteral.");
	// 	}
	//
	// 	return {
	// 		properties: {
	// 			k: TypeKind.Object,
	// 			props: getProperties(typeSymbol, type, context)
	// 		},
	// 		localType: false
	// 	};
	// }
	// else if ((type.flags & ts.TypeFlags.TypeParameter) == ts.TypeFlags.TypeParameter && (typeSymbol.flags & ts.SymbolFlags.TypeParameter) == ts.SymbolFlags.TypeParameter)
	// {
	// 	if (context.config.debugMode)
	// 	{
	// 		log.info("'typeSymbol' is TypeParameter.");
	// 	}
	//
	// 	if (typeSymbol.declarations)
	// 	{
	// 		const typeParameter = typeSymbol.declarations[0];
	//
	// 		if (ts.isTypeParameterDeclaration(typeParameter))
	// 		{
	// 			return {
	// 				properties: {
	// 					k: TypeKind.TypeParameter,
	// 					n: typeParameter.name.escapedText as string,
	// 					con: typeParameter.constraint && getTypeCall(
	// 						checker.getTypeAtLocation(typeParameter.constraint),
	// 						checker.getSymbolAtLocation(typeParameter.constraint),
	// 						context
	// 					) || undefined,
	// 					def: typeParameter.default && getTypeCall(
	// 						checker.getTypeAtLocation(typeParameter.default),
	// 						checker.getSymbolAtLocation(typeParameter.default),
	// 						context
	// 					) || undefined
	// 				},
	// 				localType: false
	// 			};
	// 		}
	// 	}
	//
	// 	context.log.error("Unable to resolve TypeParameter's declaration.");
	// 	return { properties: UNKNOWN_TYPE_PROPERTIES, localType: false };
	// }

	// const decorators = getDecorators(typeSymbol, context);
	// const kind = getTypeKind(typeSymbol);
	// const symbolToUse = typeSymbol || symbol;
	//
	// if (kind === undefined)
	// {
	// 	context.log.error(`Unable to identify kind of type '${typeSymbol.escapedName}'`);
	// 	return { properties: UNKNOWN_TYPE_PROPERTIES, localType: false };
	// }
	//
	// let localType = false;
	// const properties: TypePropertiesSource = {
	// 	k: kind,
	// 	n: typeSymbol.getName(),
	// 	fn: getTypeFullName(symbolToUse, context),
	// 	props: getProperties(symbolToUse, type, context),
	// 	meths: getMethods(symbolToUse, type, context),
	// 	decs: decorators,
	// };
	//
	// if (kind === TypeKind.Class)
	// {
	// 	const symbolType = getType(typeSymbol, context);
	//
	// 	if (!symbolType)
	// 	{
	// 		context.log.error(`Unable to identify type of class '${typeSymbol.escapedName}'`);
	// 		return { properties: UNKNOWN_TYPE_PROPERTIES, localType: false };
	// 	}
	//
	// 	properties.ctors = getConstructors(symbolType, context);
	//
	// 	if (typeCtor)
	// 	{
	// 		const constructorExport = getExportOfConstructor(typeSymbol, typeCtor, context);
	//
	// 		if (constructorExport)
	// 		{
	// 			if (context.config.isServerMode())
	// 			{
	// 				properties.ctorDesc = nodeGenerator.createObjectLiteralExpressionNode(constructorExport);
	// 			}
	//
	// 			const [ctorGetter, ctorRequireCall] = createCtorPromise(typeCtor, constructorExport, context);
	//
	// 			if (ctorGetter)
	// 			{
	// 				properties.ctor = ctorGetter;
	//
	// 				// TODO: Review. TypeCtors seems unused.
	// 				if (ctorRequireCall)
	// 				{
	// 					context.addTypeCtor(ctorRequireCall);
	// 				}
	// 			}
	// 		}
	// 		// If it is not exported, it must be getType<> of local class; in that case, we have direct access to class. But this type info must be generated in file.
	// 		else
	// 		{
	// 			localType = true;
	//
	// 			let expression = typeCtor as ts.Expression;
	//
	// 			// In "typelib" mode we have to use typeof() to ensure there will be no error after getting ctor, 
	// 			// because Identifier will be undefined in typelib file
	// 			if (context.config.useMetadataType == MetadataTypeValues.typeLib)
	// 			{
	// 				expression = ts.factory.createConditionalExpression(
	// 					ts.factory.createBinaryExpression(
	// 						ts.factory.createTypeOfExpression(expression),
	// 						ts.factory.createToken(ts.SyntaxKind.EqualsEqualsToken),
	// 						ts.factory.createStringLiteral("function")
	// 					),
	// 					ts.factory.createToken(ts.SyntaxKind.QuestionToken),
	// 					expression,
	// 					ts.factory.createToken(ts.SyntaxKind.ColonToken),
	// 					ts.factory.createIdentifier("undefined")
	// 				);
	// 			}
	//
	// 			// function() { return Promise.resolve(TypeCtor) }
	// 			properties.ctor = ts.factory.createFunctionExpression(
	// 				undefined,
	// 				undefined,
	// 				undefined,
	// 				undefined,
	// 				[],
	// 				undefined,
	// 				ts.factory.createBlock([
	// 					ts.factory.createReturnStatement(
	// 						ts.factory.createCallExpression(
	// 							ts.factory.createPropertyAccessExpression(
	// 								ts.factory.createIdentifier("Promise"),
	// 								ts.factory.createIdentifier("resolve")
	// 							),
	// 							undefined,
	// 							[
	// 								expression
	// 							]
	// 						)
	// 					)
	// 				], true)
	// 			);
	// 		}
	//
	// 	}
	// }

	// const declaration = typeSymbol.declarations?.[0];
	//
	// if (declaration && (
	// 	ts.isClassDeclaration(declaration) || ts.isInterfaceDeclaration(declaration)
	// ))
	// {
	// 	// extends & implements
	// 	if (declaration.heritageClauses)
	// 	{
	// 		const ext = declaration.heritageClauses.filter(h => h.token == ts.SyntaxKind.ExtendsKeyword)[0];
	//
	// 		if (ext)
	// 		{
	// 			properties.bt = getTypeCall(
	// 				checker.getTypeAtLocation(ext.types[0]),
	// 				checker.getSymbolAtLocation(ext.types[0]),
	// 				context
	// 			);
	// 		}
	//
	// 		const impl = declaration.heritageClauses.filter(h => h.token == ts.SyntaxKind.ImplementsKeyword)[0];
	//
	// 		if (impl)
	// 		{
	// 			properties.iface = getTypeCall(
	// 				checker.getTypeAtLocation(impl.types[0]),
	// 				checker.getSymbolAtLocation(impl.types[0]),
	// 				context
	// 			);
	// 		}
	// 	}
	//
	// 	// Type parameters
	// 	if (declaration.typeParameters)
	// 	{
	// 		properties.tp = declaration.typeParameters.map(typeParameterDeclaration => getTypeCall(
	// 			checker.getTypeAtLocation(typeParameterDeclaration),
	// 			checker.getSymbolAtLocation(typeParameterDeclaration),
	// 			context
	// 		));
	// 	}
	// }

	// return {
	// 	properties: properties,
	// 	localType: localType
	// };
}


function mapEnum(type: ts.EnumType, typeNode: ts.TypeNode, context: Context): TypeMapperResult
{
	return undefined;
}

function mapEnumLiteral(type: ts.UnionType, typeNode: ts.TypeNode, context: Context): TypeMapperResult
{
	return {
		id: getTypeId(type),
		kind: TypeKind.EnumLiteral,
		name: type.symbol.escapedName.toString(),
		types: type.types.map(type => context.metadata.addType(typeNode, type)/*getTypeCall(type, undefined, context)*/)  // TODO: There cannot be "typeNode". AddType must be refactored cuz typeNode is not accessible in all cases.
	};
}

function mapESSymbol(type: ts.Type, typeNode: ts.TypeNode, context: Context): TypeMapperResult
{
	return {
		kind: TypeKind.Symbol
	};
}

function mapUniqueEESymbol(type: ts.UniqueESSymbolType, typeNode: ts.TypeNode, context: Context): TypeMapperResult
{
	return {
		id: getTypeId(type),
		kind: TypeKind.UniqueSymbol,
		name: type.escapedName?.toString()
	};
}

function mapObject(type: ts.ObjectType, typeNode: ts.TypeNode, context: Context): TypeMapperResult
{
	const mapper = ObjectFlagsMappers[type.objectFlags];

	if (mapper)
	{
		const mapperResult = mapper(type, typeNode, context);

		if (mapperResult)
		{
			return mapperResult;
		}

		context.log.warn("Unhandled object type kind with object flag " + type.objectFlags);
	}

	const symbol = type.aliasSymbol || type.symbol;

	if ((type.objectFlags & ts.ObjectFlags.Class) || (type.objectFlags & ts.ObjectFlags.Interface))
	{
		const decorators = getDecorators(symbol, context);
		let localType = false;

		let props = type.getProperties();

		const properties: TypeProperties = {
			id: getTypeId(type),
			kind: type.objectFlags === ts.ObjectFlags.Class ? TypeKind.Class : TypeKind.Interface,
			name: symbol.getEscapedName().toString(),
			fullName: getTypeFullName(type, context),
			properties: getProperties(context, type),
			methods: getMethods(context, type),
			decorators: decorators,
		};

		if (type.objectFlags == ts.ObjectFlags.Class)
		{
			properties.constructors = getConstructors(type, context);

			const constructorExport = undefined;//getExportOfConstructor(symbol, context); // TODO: Implement

			if (constructorExport)
			{
				// // if (context.config.isServerMode())
				// // {
				// // 	properties.ctorDesc = createValueExpression(constructorExport);
				// // }
				//
				// const [ctorGetter, ctorRequireCall] = createCtorPromise(constructorExport, context);
				//
				// if (ctorGetter)
				// {
				// 	properties.ctor = ctorGetter;
				//
				// 	// // TODO: Review. TypeCtors seems unused.
				// 	// if (ctorRequireCall)
				// 	// {
				// 	// 	context.addTypeCtor(ctorRequireCall);
				// 	// }
				// }
			}
			// If it is not exported, it must be getType<> of local class; in that case, we have direct access to class. But this type info must be generated in file.
			else
			{
				properties.notExported = true;

				if (ts.isTypeReferenceNode(typeNode))
				{
					let expression: ts.Expression = getTypeNodeIdentifier(typeNode) as ts.Expression;

					if (expression)
					{
						// In "typelib" mode we have to use typeof() to ensure there will be no error after getting ctor, 
						// because Identifier will be undefined in typelib file
						if (context.config.metadataType == MetadataTypeValues.typeLib)
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
		}

		const declaration = getDeclaration(symbol);

		if (declaration && (ts.isClassDeclaration(declaration) || ts.isInterfaceDeclaration(declaration)))
		{
			// extends & implements
			if (declaration.heritageClauses)
			{
				const ext = declaration.heritageClauses.filter(h => h.token == ts.SyntaxKind.ExtendsKeyword)[0];

				if (ext)
				{
					properties.baseType = context.metadata.addType(ext.types[0]);
					// getTypeCall(
					// 	context.typeChecker.getTypeAtLocation(ext.types[0]),
					// 	context.typeChecker.getSymbolAtLocation(ext.types[0]),
					// 	context
					// );
				}

				const impl = declaration.heritageClauses.filter(h => h.token == ts.SyntaxKind.ImplementsKeyword)[0];

				if (impl)
				{
					properties.interface = context.metadata.addType(impl.types[0]);
					// getTypeCall(
					// 	context.typeChecker.getTypeAtLocation(impl.types[0]),
					// 	context.typeChecker.getSymbolAtLocation(impl.types[0]),
					// 	context
					// );
				}
			}

			// Type parameters
			if (declaration.typeParameters)
			{
				properties.typeParameters = declaration.typeParameters.map(typeParameterDeclaration => {
						// typeParameterDeclaration.
						const type = context.typeChecker.getTypeAtLocation(typeParameterDeclaration);
						const typeNode = context.typeChecker.typeToTypeNode(type, declaration, undefined); // TODO: Review this!!!!!!!!!

						if (typeNode)
						{
							return context.metadata.addType(typeNode);
						}
						// 	context.typeChecker.getTypeAtLocation(typeParameterDeclaration),
						// 	context.typeChecker.getSymbolAtLocation(typeParameterDeclaration),
						// 	context
						// )

						return UnknownTypeReference;
					}
				);
			}
		}

		return properties;
	}

	if (type.aliasSymbol && type.aliasTypeArguments)
	{
		// type.mapper
	}

	switch (type.objectFlags)
	{
		case ts.ObjectFlags.Reference:
			break;

		case ts.ObjectFlags.JsxAttributes:
			break;

		case ts.ObjectFlags.ArrayLiteral:
			break;
	}

	context.log.warn("Unhandled object type kind with object flag " + type.objectFlags);

	return undefined;

	// return {
	// 	properties: {
	// 		k: TypeKind.UniqueSymbol,
	// 		n: type.escapedName?.toString()
	// 	},
	// 	localType: false
	// };
}

function mapUnion(type: ts.UnionType, typeNode: ts.TypeNode, context: Context): TypeMapperResult
{
	// return {
	// 		kind: TypeKind.Union,
	// 		name: type.symbol?.escapedName.toString(),
	// 		types: type.types.map((type: ts.Type) => getTypeCall(type, undefined, context))
	// };

	return undefined;
}

function mapIntersection(type: ts.IntersectionType, typeNode: ts.TypeNode, context: Context): TypeMapperResult
{
	// return {
	// 		kind: TypeKind.Intersection,
	// 		name: type.symbol?.escapedName.toString(),
	// 		types: type.types.map((type: ts.Type) => getTypeCall(type, undefined, context))
	// };

	return undefined;
}

function mapIndex(type: ts.IndexType, typeNode: ts.TypeNode, context: Context): TypeMapperResult
{
	return undefined;
}

function mapIndexedAccessType(type: ts.IndexedAccessType, typeNode: ts.TypeNode, context: Context): TypeMapperResult
{
	// return {
	// 		kind: TypeKind.IndexedAccess,
	// 		indexedAccess: {
	// 			objectType: getTypeCall(type.objectType, type.objectType.symbol, context),
	// 			indexType: getTypeCall(type.indexType, type.indexType.symbol, context)
	// 		}
	// };

	return undefined;
}

function mapConditional(type: ts.ConditionalType, typeNode: ts.TypeNode, context: Context): TypeMapperResult
{
	const ct = type.root.node;
	const extendsType = context.typeChecker.getTypeAtLocation(ct.extendsType);
	const trueType = context.typeChecker.getTypeAtLocation(ct.trueType);

	// return {
	// 		kind: TypeKind.ConditionalType,
	// 		condition: {
	// 			extends: getTypeCall(extendsType, extendsType.symbol, context),
	// 			trueType: getTypeCall(trueType, trueType.symbol, context),
	// 			falseType: getTypeCall(context.typeChecker.getTypeAtLocation(ct.falseType), context.typeChecker.getSymbolAtLocation(ct.falseType), context)
	// 		}
	// };

	return undefined;
}

function mapTemplateLiteral(type: ts.TemplateLiteralType, typeNode: ts.TypeNode, context: Context): TypeMapperResult
{
	return undefined;
}

function mapTypeParameter(type: ts.Type, typeNode: ts.TypeNode, context: Context): TypeMapperResult
{
	const declaration = getDeclaration(type.symbol);

	if (declaration)
	{
		if (ts.isTypeParameterDeclaration(declaration))
		{
			return {
				id: getTypeId(type),
				kind: TypeKind.TypeParameter,
				name: declaration.name.escapedText as string,
				generic: {
					constraint: declaration.constraint && context.metadata.addType(declaration.constraint
						// context.typeChecker.getTypeAtLocation(declaration.constraint),
						// context.typeChecker.getSymbolAtLocation(declaration.constraint),
						// context
					) || undefined,
					default: declaration.default && context.metadata.addType(declaration.default
						// context.typeChecker.getTypeAtLocation(declaration.default),
						// context.typeChecker.getSymbolAtLocation(declaration.default),
						// context
					) || undefined
				}
			};
		}
	}

	context.log.error("Unable to resolve TypeParameter's declaration.");
	return UnknownTypeProperties;
}

function mapTuple(type: ts.TupleType, typeNode: ts.TypeNode, context: Context): TypeMapperResult
{
	const symbol = type.aliasSymbol || type.symbol;

	if (!symbol)
	{
		return undefined;
	}

	if ((type.target as ts.TupleType).labeledElementDeclarations)
	{
		// TODO: labeled
	}

	return {
		id: getTypeId(type),
		kind: TypeKind.Tuple,
		name: symbol?.name,
		fullName: getTypeFullName(type, context),
		// TODO: Properties
		// properties: type.typeArguments?.map((propType, i) => ({ n: i.toString(), t: getTypeCall(propType, undefined, context, getCtorTypeReference(propType.symbol)) }))
	};
}

function mapObjectLiteral(type: ts.ObjectType, typeNode: ts.TypeNode, context: Context): TypeMapperResult
{
	const symbol = type.aliasSymbol || type.symbol;

	return {
		id: getTypeId(type),
		kind: TypeKind.Object,
		properties: getProperties(context, type)
	};
}