import * as path          from "path";
import {
	AccessModifier,
	Accessor,
	TypeKind
}                         from "@rtti/abstract";
import {
	REFLECT_DECORATOR
}                         from "tst-reflect";
import * as ts            from "typescript";
import { Context }        from "./contexts/Context";
import { ImportInfo }     from "./declarations";
import { log }            from "./log";
import { getDeclaration } from "./utils/symbolHelpers";

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
export const UNKNOWN_TYPE_PROPERTIES = { k: TypeKind.Unknown };

// /**
//  * Variable to cache created "unknown" type call
//  */
// let unknownTypeCallExpression: GetTypeCall | undefined = undefined;

/**
 * Get type of symbol
 * @param symbol
 * @param context
 */
export function getType(symbol: ts.Symbol, context: Context): ts.Type | undefined
{
	if (symbol.flags == ts.SymbolFlags.Interface/* || symbol.flags == ts.SymbolFlags.Alias*/)
	{
		return context.typeChecker.getDeclaredTypeOfSymbol(symbol);
	}

	const declaration = getDeclaration(symbol);

	if (!declaration)
	{
		context.log.error("Unable to resolve declarations of symbol.");
		return undefined;
	}

	return context.typeChecker.getTypeOfSymbolAtLocation(symbol, declaration);
}

// let symbolIdCounter = -1;
//
// function getSymbolId(symbol: ts.Symbol): number
// {
// 	return (symbol as any).id ?? ((symbol as any).id = symbolIdCounter--);
// }

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

// /**
//  * Get Kind of type
//  * @param symbol
//  */
// export function getTypeKind(symbol: ts.Symbol): TypeKind | undefined
// {
// 	if (symbol.flags & ts.SymbolFlags.Class)
// 	{
// 		return TypeKind.Class;
// 	}
//
// 	if (symbol.flags & ts.SymbolFlags.Interface)
// 	{
// 		return TypeKind.Interface;
// 	}
//
// 	if (symbol.flags & ts.SymbolFlags.Module)
// 	{
// 		return TypeKind.Module;
// 	}
//
// 	if (symbol.flags & ts.SymbolFlags.Method)
// 	{
// 		return TypeKind.Method;
// 	}
//
// 	log.error("Unknown type kind");
// 	return undefined;
// }


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

// // TODO: Remove
// export function getProjectSrcRoot(program: ts.Program): string
// {
// 	return path.resolve(program.getCompilerOptions()?.rootDir || program.getCurrentDirectory());
// }

/**
 * Return getter function for runtime type's Ctor.
 * @description Function generated so that, the require call isn't made until we actually call the function
 */
export function createCtorPromise(
	constructorDescription: ImportInfo | undefined,
	context: Context
): [promise: ts.FunctionExpression | undefined, requireCall: ts.PropertyAccessExpression | undefined] // TODO: Move this to some metadata writer
{
	if (!constructorDescription)
	{
		return [undefined, undefined];
	}

	let relative = context.metadata.writer.getRequireRelativePath(context, constructorDescription.path);

	if (context.config.debugMode)
	{
		log.info(`Relative import for source file(${context.currentSourceFile.fileName}) is: ${relative}`);
	}

	if (context.config.esmModule)
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
						ts.factory.createIdentifier(constructorDescription.exportName)
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
		ts.factory.createIdentifier(constructorDescription.exportName)
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

// /**
//  * Return true if there is readonly modifier
//  * @param context
//  */
// export function getUnknownTypeCall(context: Context): GetTypeCall
// {
// 	return unknownTypeCallExpression || (unknownTypeCallExpression = getTypeCallFromProperties(UNKNOWN_TYPE_PROPERTIES, context));
// }

/**
 * Return signature of method/function
 * @param symbol
 * @param context
 */
export function getFunctionLikeSignature(symbol: ts.Symbol, context: Context): ts.Signature | undefined
{
	const declaration = getDeclaration(symbol);

	if (declaration && (ts.isMethodSignature(declaration) || ts.isMethodDeclaration(declaration)))
	{
		return context.typeChecker.getSignatureFromDeclaration(declaration);
	}

	const type = getType(symbol, context);

	if (!type)
	{
		return undefined;
	}

	return context.typeChecker.getSignaturesOfType(type, ts.SignatureKind.Call)?.[0];
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

// function getOutputPathWithoutChangingExt(inputFileName: string, configFile: ts.ParsedCommandLine, ignoreCase: boolean, getCommonSourceDirectory) {
// 	return configFile.options.outDir ?
// 		(ts as any).resolvePath(configFile.options.outDir, (ts as any).getRelativePathFromDirectory(getCommonSourceDirectory ? getCommonSourceDirectory() : getCommonSourceDirectoryOfConfig(configFile, ignoreCase), inputFileName, ignoreCase)) :
// 		inputFileName;
// }

export function getOutPathForSourceFile(sourceFileName: string, context: Context): string
{
	if (isTsNode())
	{
		return sourceFileName;
	}

	if (context.config.parsedCommandLine)
	{
		// getOutputPathWithoutChangingExt(
		// 	sourceFileName,
		// 	context.config.parsedCommandLine,
		// 	true,
		// 	context
		// )
		return ts.getOutputFileNames(context.config.parsedCommandLine, sourceFileName, false).filter(fn => fn.slice(-3) == ".js" || fn.slice(-4) == ".jsx")[0];
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