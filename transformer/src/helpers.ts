import * as path                     from "path";
import {
	AccessModifier,
	Accessor,
	TypeKind,
	REFLECT_DECORATOR
}                                    from "tst-reflect";
import { TypeFlags }                 from "typescript";
import * as ts                       from "typescript";
import { Context }                   from "./contexts/Context";
import TransformerContext            from "./contexts/TransformerContext";
import {
	ConstructorImportDescriptionSource,
	GetTypeCall
}                                    from "./declarations";
import { getTypeCallFromProperties } from "./getTypeCall";
import { log }                       from "./log";

export const PATH_SEPARATOR_REGEX = /\\/g;

/**
 * Name of parameter for method/function declarations containing generic getType() calls
 */
export const GENERIC_PARAMS = "__genericParams__";

/**
 * Package name/identifier
 */
export const PACKAGE_ID = "tst-reflect-transformer";

/**
 * Name of decorator or JSDoc comment marking method for tracing
 */
export const TRACE_DECORATOR = "trace";

/**
 * Properties of Unknown type
 * @type {{k: TypeKind, n: string}}
 */
export const UNKNOWN_TYPE_PROPERTIES = { n: "unknown", k: TypeKind.Native };

/**
 * Variable to cache created "unknown" type call
 */
let unknownTypeCallExpression: GetTypeCall | undefined = undefined;

/**
 * Get type of symbol
 * @param symbol
 * @param checker
 */
export function getType(symbol: ts.Symbol, checker: ts.TypeChecker): ts.Type | undefined
{
	if (symbol.flags == ts.SymbolFlags.Interface/* || symbol.flags == ts.SymbolFlags.Alias*/)
	{
		return checker.getDeclaredTypeOfSymbol(symbol);
	}

	const declaration = getDeclaration(symbol);

	if (!declaration)
	{
		return undefined;
	}

	return checker.getTypeOfSymbolAtLocation(symbol, declaration);
}

/**
 * Get Symbol of Type
 * @param type
 * @param typeChecker
 */
export function getTypeSymbol(type: ts.Type, typeChecker: ts.TypeChecker): ts.Symbol | undefined
{
	const symbol = type.aliasSymbol || type.symbol;

	if (symbol)
	{
		return (symbol.flags & ts.SymbolFlags.Alias) ? typeChecker.getAliasedSymbol(symbol) : symbol;
	}

	return undefined;
}

/**
 * Check if the type is an Array
 * @param type
 */
export function isArrayType(type: ts.Type): type is ts.GenericType
{
	// [Hookyns] Check if type is Array. I found no direct way to do so.
	return !!(type.flags & TypeFlags.Object) && type.symbol?.escapedName == "Array";
}

/**
 * Check if the type is an Promise
 * @param type
 */
export function isPromiseType(type: ts.Type): type is ts.GenericType
{
	// [Hookyns] Check if type is Promise. I found no direct way to do so.
	return !!(type.flags & TypeFlags.Object) && type.symbol?.escapedName == "Promise";
}

let typeIdCounter = -1;

/**
 * Returns id of given type
 * @description Id is taken from type's Symbol.
 * @param type
 * @param typeChecker
 */
export function getTypeId(type: ts.Type, typeChecker: ts.TypeChecker): number
{
	return (type as any).id ?? ((type as any).id = typeIdCounter--);
}

/**
 * Returns declaration of symbol. ValueDeclaration is preferred.
 * @param symbol
 */
export function getDeclaration(symbol?: ts.Symbol): ts.Declaration | undefined
{
	if (!symbol)
	{
		return undefined;
	}

	return symbol.valueDeclaration || symbol.declarations?.[0];
}

/**
 * Get Kind of type
 * @param symbol
 */
export function getTypeKind(symbol: ts.Symbol)
{
	if ((symbol.flags & ts.SymbolFlags.Class) !== 0)
	{
		return TypeKind.Class;
	}

	if ((symbol.flags & ts.SymbolFlags.Interface) !== 0)
	{
		return TypeKind.Interface;
	}

	if ((symbol.flags & ts.SymbolFlags.Module) !== 0)
	{
		return TypeKind.Module;
	}

	if ((symbol.flags & ts.SymbolFlags.Method) !== 0)
	{
		return TypeKind.Method;
	}

	if ((symbol.flags & ts.SymbolFlags.RegularEnum) !== 0)
	{
		return TypeKind.Enum;
	}

	return null;
}

const nodeModulesPattern = "/node_modules/";

/**
 * Returns symbol of the type.
 * @param type
 */
export function getSymbol(type: ts.Type): ts.Symbol
{
	return type.aliasSymbol || type.symbol; // TODO: Check aliasSymbol vs symbol
}

/**
 * Get full name of the type
 * @param type
 * @param context
 */
export function getTypeFullName(type: ts.Type, context: Context)
{
	const symbol = getSymbol(type);
	const declaration = getDeclaration(symbol);

	if (!declaration)
	{
		if (context.config.debugMode)
		{
			context.log.error("Unable to get fullname of type, because its symbol is undefined.");
		}

		return undefined;
	}

	let { packageName, rootDir } = TransformerContext.instance.config;
	let filePath = declaration.getSourceFile().fileName;
	const nodeModulesIndex = filePath.lastIndexOf(nodeModulesPattern);

	if (nodeModulesIndex != -1)
	{
		filePath = filePath.slice(nodeModulesIndex + nodeModulesPattern.length);
	}
	else if (rootDir)
	{
		filePath = packageName + "/" + path.relative(rootDir, filePath).replace(PATH_SEPARATOR_REGEX, "/");
	}

	return filePath + ":" + symbol.getName() + "#" + getTypeId(type, context.typeChecker); // TODO: Check if type can be used in getTypeId(); references, aliases? It must be Id of final type.
}

/**
 * Check that value is TS Expression
 * @param value
 */
export function isExpression(value: any)
{
	return value.hasOwnProperty("kind") && (value.constructor.name == "NodeObject" || value.constructor.name == "IdentifierObject" || value.constructor.name == "TokenObject");
}

/**
 * Check that function-like declaration has JSDoc with @reflect tag.
 * @param symbol
 */
export function hasReflectJsDoc(symbol: ts.Symbol | undefined): boolean
{
	if (!symbol)
	{
		return false;
	}

	// If declaration contains @reflect in JSDoc comment, pass all generic arguments
	return symbol.getJsDocTags().some(tag => tag.name === REFLECT_DECORATOR);
}

/**
 * Check that function-like declaration has JSDoc with @trace tag.
 * @param fncType
 */
export function hasTraceJsDoc(fncType: ts.Type): boolean
{
	const symbol = fncType.getSymbol();

	if (!symbol)
	{
		return false;
	}

	// If declaration contains @trace in JSDoc comment, pass all generic arguments
	return symbol.getJsDocTags().some(tag => tag.name === TRACE_DECORATOR);
}

export function getSourceFileImports(sourceFile: ts.SourceFile): ts.ImportDeclaration[]
{
	return sourceFile.statements.filter(st => ts.isImportDeclaration(st)) as ts.ImportDeclaration[];
}

// TODO: Remove
export function hasRuntimePackageImport(sourceFile: ts.SourceFile): [boolean, string[], number]
{
	const imports = getSourceFileImports(sourceFile);

	if (!imports?.length)
	{
		return [false, [], -1];
	}

	let getTypeNodePosition = -1;
	let isImported = false;
	const namedImports: string[] = [];

	for (let fileImp of imports)
	{
		if ((<any>fileImp?.moduleSpecifier)?.text?.toString() !== "tst-reflect")
		{
			continue;
		}

		isImported = true;

		const clause: any = fileImp.importClause;

		if (!ts.isImportClause(clause) || clause?.namedBindings === undefined)
		{
			continue;
		}

		const bindings: ts.NamedImportBindings = clause?.namedBindings;
		if (!ts.isNamedImports(bindings))
		{
			continue;
		}

		bindings.elements.forEach(e => {
			if (!e?.name?.text?.toString() || namedImports.includes(e.name.text.toString()))
			{
				return;
			}
			if (e.name.text.toString() === "getType")
			{
				getTypeNodePosition = fileImp.pos;
			}

			namedImports.push(e.name.text.toString());
		});
	}


	return [isImported, namedImports, getTypeNodePosition];
}

// TODO: Remove
export function getProjectSrcRoot(program: ts.Program): string
{
	return path.resolve(program.getCompilerOptions()?.rootDir || program.getCurrentDirectory());
}

/**
 * Return getter function for runtime type's Ctor.
 * @description Function generated so that, the require call isn't made until we actually call the function
 */
export function createCtorPromise(
	typeCtor: ts.EntityName | ts.DeclarationName,
	constructorDescription: ConstructorImportDescriptionSource | undefined,
	context: Context
): [promise: ts.FunctionExpression | undefined, requireCall: ts.PropertyAccessExpression | undefined]
{
	if (!constructorDescription)
	{
		return [undefined, undefined];
	}

	let relative = context.metaWriter.getRequireRelativePath(context, constructorDescription.srcPath);

	if (context.config.debugMode)
	{
		log.info(`Relative import for source file(${context.currentSourceFile.fileName}) is: ${relative}`);
	}

	if (context.config.esmModuleKind)
	{
		// import("...path...").then(m => m.ExportedMember)
		const importExpression = ts.factory.createCallExpression(
			ts.factory.createPropertyAccessExpression(
				ts.factory.createCallExpression(
					ts.factory.createIdentifier("import"),
					undefined,
					[
						ts.factory.createStringLiteral(relative)
					]
				),
				"then"
			),
			undefined,
			[
				ts.factory.createArrowFunction(
					undefined,
					undefined,
					[
						ts.factory.createParameterDeclaration(
							undefined,
							undefined,
							undefined,
							"m"
						)
					],
					undefined,
					ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
					ts.factory.createPropertyAccessExpression(
						ts.factory.createIdentifier("m"),
						ts.factory.createIdentifier(constructorDescription.en)
					)
				)
			]
		);

		return [
			// function() { return $importExpression }
			ts.factory.createFunctionExpression(
				undefined,
				undefined,
				undefined,
				undefined,
				[],
				undefined,
				ts.factory.createBlock([ts.factory.createReturnStatement(importExpression)], true)
			),
			undefined
		];
	}

	// require("...path...")
	const requireCall = ts.factory.createPropertyAccessExpression(
		ts.factory.createCallExpression(
			ts.factory.createIdentifier("require"),
			undefined,
			[ts.factory.createStringLiteral(relative)]
		),
		ts.factory.createIdentifier(constructorDescription.en)
	);

	// Promise.resolve($require)
	const promise = ts.factory.createCallExpression(
		ts.factory.createPropertyAccessExpression(
			ts.factory.createIdentifier("Promise"),
			ts.factory.createIdentifier("resolve")
		),
		undefined,
		[
			requireCall
		]
	);

	// function() { return $Promise }
	const functionCall = ts.factory.createFunctionExpression(
		undefined,
		undefined,
		undefined,
		undefined,
		[],
		undefined,
		ts.factory.createBlock([ts.factory.createReturnStatement(promise)], true)
	);

	return [functionCall, requireCall];
}

/**
 * Return AccessModifier
 * @param modifiers
 */
export function getAccessModifier(modifiers?: ts.ModifiersArray): AccessModifier
{
	const kinds = modifiers?.map(m => m.kind) ?? [];

	if (kinds.includes(ts.SyntaxKind.PrivateKeyword))
	{
		return AccessModifier.Private;
	}

	if (kinds.includes(ts.SyntaxKind.ProtectedKeyword))
	{
		return AccessModifier.Protected;
	}

	return AccessModifier.Public;
}

/**
 * Return Accessor (getter/setter)
 * @param node
 */
export function getAccessor(node?: ts.Declaration): Accessor
{
	if (node != undefined)
	{
		if (node.kind == ts.SyntaxKind.GetAccessor)
		{
			return Accessor.Getter;
		}

		if (node.kind == ts.SyntaxKind.SetAccessor)
		{
			return Accessor.Setter;
		}
	}

	return Accessor.None;
}

/**
 * Return true if there is readonly modifier
 * @param modifiers
 */
export function isReadonly(modifiers?: ts.ModifiersArray): boolean
{
	return modifiers?.some(m => m.kind == ts.SyntaxKind.ReadonlyKeyword) ?? false;
}

/**
 * Return true if there is readonly modifier
 * @param context
 */
export function getUnknownTypeCall(context: Context): GetTypeCall
{
	return unknownTypeCallExpression || (unknownTypeCallExpression = getTypeCallFromProperties(UNKNOWN_TYPE_PROPERTIES, context));
}

/**
 * Return signature of method/function
 * @param symbol
 * @param checker
 */
export function getFunctionLikeSignature(symbol: ts.Symbol, checker: ts.TypeChecker): ts.Signature | undefined
{
	const declaration = getDeclaration(symbol);

	if (declaration && (ts.isMethodSignature(declaration) || ts.isMethodDeclaration(declaration)))
	{
		return checker.getSignatureFromDeclaration(declaration);
	}

	const type = getType(symbol, checker);

	if (type === undefined)
	{
		return type;
	}

	return checker.getSignaturesOfType(type, ts.SignatureKind.Call)?.[0];
}

/**
 * This is useful.... if we're using ts-node for ex, it doesn't use our outDir configured
 * Instead it will use .ts-node
 * @returns {boolean}
 */
export function isTsNode(): boolean
{
	// are we running via a ts-node/ts-node-dev shim?
	const lastArg = process.execArgv[process.execArgv.length - 1];
	if (lastArg && path.parse(lastArg).name.indexOf("ts-node") >= 0)
	{
		return true;
	}

	try
	{
		/**
		 * Are we running in typescript at the moment?
		 * see https://github.com/TypeStrong/ts-node/pull/858 for more details
		 */
			//@ts-ignore
		const isTsNode = process[Symbol.for("ts-node.register.instance")];

		return isTsNode?.ts !== undefined;
	}
	catch (error)
	{
		console.error(error);
	}
	return false;
}

export function getRequireRelativePath(sourceFileDefiningImport: string, sourceFileImporting: string)
{
	return replaceExtension(
		"./" + path.relative(path.dirname(sourceFileDefiningImport), sourceFileImporting),
		""
	);
}

export function getOutPathForSourceFile(sourceFileName: string, context: TransformerContext, useTsNode: boolean = true): string
{
	if (useTsNode && isTsNode())
	{
		return sourceFileName;
	}

	if (context.config.parsedCommandLine)
	{
		if (!context.config.parsedCommandLine.fileNames.includes(sourceFileName))
		{
			context.config.parsedCommandLine.fileNames.push(sourceFileName);
		}

		return ts.getOutputFileNames(context.config.parsedCommandLine, sourceFileName, false)
			.filter(fn => fn.slice(-3) == ".js" || fn.slice(-4) == ".jsx" || fn.slice(-5) == ".d.ts")[0];
	}

	// Get the actual file location, regardless of dist/source dir
	// This should leave us with:
	// /ctor-reflection/SomeServiceClass.ts
	let outPath = sourceFileName.replace(context.config.rootDir, "");

	// If we have a slash at the start, it has to go
	// Now we have:
	// ctor-reflection/SomeServiceClass.ts
	if (outPath.startsWith("/"))
	{
		outPath = outPath.slice(1);
	}

	// Now we can take the build path, from the tsconfig file and combine it
	// This should give us:
	// /Users/sam/Code/Packages/ts-reflection/dev/testing/dist/method-reflection/index.ts
	outPath = path.join(context.config.outDir, outPath);

	return replaceExtension(outPath, ".js");
}

export function replaceExtension(fileName: string, replaceWith: string): string
{
	const extName = path.extname(fileName);
	// If we're running ts-node, the outDir is set to ".ts-node" and it can't be over-ridden
	// If we just do .replace(extName, '.js'), it won't replace the actual file extension
	// Now we just replace the extension:
	if (fileName.endsWith(extName))
	{
		fileName = fileName.slice(0, fileName.length - extName.length) + replaceWith;
	}

	return fileName.replace(PATH_SEPARATOR_REGEX, "/");
}

/**
 * Check if declaration has "type": TypeNode property.
 * @param declaration
 */
export function isTypedDeclaration(declaration: ts.Declaration): declaration is (ts.Declaration & { type: ts.TypeNode })
{
	return !!(declaration as any)?.type;
}

// TODO: Find the proper way to do this... but this actually works perfectly
// This allows us to get the ctor node which we resolve descriptor info and create the ctor require
export function getCtorTypeReference(symbol: ts.Symbol): ts.Identifier | undefined
{
	const declaration = getDeclaration(symbol);

	if (!declaration)
	{
		return undefined;
	}

	if (isTypedDeclaration(declaration))
	{
		let typeName: ts.Identifier | undefined = undefined;

		if (ts.isIndexedAccessTypeNode(declaration.type))
		{
			typeName = (declaration.type.indexType as any).typeName;
		}
		else
		{
			typeName = (declaration.type as any).typeName;
		}

		if (typeName && typeName?.kind === ts.SyntaxKind.Identifier)
		{
			return typeName;
		}
	}

	return undefined;
}

const IGNORE_PROPERTY_NAME = "__ignore-node-reflection";

/**
 * Check if node should be ignored for processing
 * @param node
 */
export function isNodeIgnored(node: ts.Node)
{
	return node.pos == -1 || (node as any)[IGNORE_PROPERTY_NAME];
}

/**
 * Set flag on node it should be ignored in future processing by tst-reflect-transformer
 * @param node
 */
export function ignoreNode(node: ts.Node)
{
	(node as any)[IGNORE_PROPERTY_NAME] = true;
}