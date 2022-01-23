import * as path          from "path";
import {
	AccessModifier,
	Accessor,
	REFLECT_DECORATOR_DECORATOR,
	REFLECT_GENERIC_DECORATOR,
	TypeKind
}                         from "tst-reflect";
import * as ts            from "typescript";
import { ModifiersArray } from "typescript";
import TransformerContext from "./contexts/TransformerContext";

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
 * Get type of symbol
 * @param symbol
 * @param checker
 */
export function getType(symbol: ts.Symbol, checker: ts.TypeChecker): ts.Type
{
	if (symbol.flags == ts.SymbolFlags.Interface || symbol.flags == ts.SymbolFlags.Alias)
	{
		return checker.getDeclaredTypeOfSymbol(symbol);
	}

	if (!symbol.valueDeclaration)
	{
		throw new Error("Unable to resolve declarations of symbol.");
	}

	return checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
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

	throw new Error("Unknown type kind");
}

const nodeModulesPattern = "/node_modules/";

/**
 * Get full name of type
 * @param typeSymbol
 */
export function getTypeFullName(typeSymbol?: ts.Symbol)
{
	if (!typeSymbol)
	{
		// TODO: Log in debug mode
		return undefined;
	}

	if (!typeSymbol.declarations)
	{
		// TODO: Log in debug mode
		throw new Error("Unable to resolve declarations of symbol.");
	}

	let { packageName, rootDir } = TransformerContext.instance.config;
	let filePath = typeSymbol.declarations[0].getSourceFile().fileName;
	const nodeModulesIndex = filePath.lastIndexOf(nodeModulesPattern);

	if (nodeModulesIndex != -1)
	{
		filePath = filePath.slice(nodeModulesIndex + nodeModulesPattern.length);
	}
	else if (rootDir)
	{
		filePath = packageName + "/" + path.relative(rootDir, filePath).replace(/\\/g, "/");
	}

	return filePath + ":" + typeSymbol.getName() + "#" + ((typeSymbol as any).id || "0");
}

/**
 * Check that value is TS Expression
 * @param value
 */
export function isExpression(value: any)
{
	return value.hasOwnProperty("kind") && (value.constructor.name == "NodeObject" || value.constructor.name == "IdentifierObject");
}

/**
 * Check that function-like declaration has JSDoc with @reflectGeneric tag.
 * @param symbol
 */
export function hasReflectGenericJsDoc(symbol: ts.Symbol | undefined): boolean
{
	if (!symbol)
	{
		return false;
	}

	// If declaration contains @reflectGeneric in JSDoc comment, pass all generic arguments
	return symbol.getJsDocTags().some(tag => tag.name === REFLECT_GENERIC_DECORATOR);
}

/**
 * Check that function-like declaration has JSDoc with @reflectDecorator tag.
 * @param symbol
 */
export function hasReflectDecoratorJsDoc(symbol: ts.Symbol | undefined): boolean
{
	if (!symbol)
	{
		return false;
	}

	// If declaration contains @reflectDecorator in JSDoc comment, pass all generic arguments
	return symbol.getJsDocTags().some(tag => tag.name === REFLECT_DECORATOR_DECORATOR);
}

/**
 * Check that function-like declaration has JSDoc with @reflectGeneric tag.
 * @param symbol
 */
export function hasAnyReflectJsDoc(symbol: ts.Symbol | undefined): boolean
{
	if (!symbol)
	{
		return false;
	}

	// If declaration contains any @reflectXxx in JSDoc comment, pass all generic arguments
	return symbol.getJsDocTags().some(tag => tag.name === REFLECT_GENERIC_DECORATOR || tag.name === REFLECT_DECORATOR_DECORATOR);
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

/**
 * Return getter (arrow function/lambda) for runtime type's Ctor.
 * @description Arrow function generated cuz of possible "Type is referenced before declaration".
 */
export function createCtorGetter(typeCtor: ts.EntityName | ts.DeclarationName | undefined)
{
	if (!typeCtor)
	{
		return undefined;
	}

	return ts.factory.createArrowFunction(undefined, undefined, [], undefined, ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken), typeCtor as ts.Expression);
}

/**
 * Return AccessModifier
 * @param modifiers
 */
export function getAccessModifier(modifiers?: ModifiersArray): AccessModifier
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
export function isReadonly(modifiers?: ModifiersArray): boolean
{
	return modifiers?.some(m => m.kind == ts.SyntaxKind.ReadonlyKeyword) ?? false;
}

/**
 * Return signature of method/function
 * @param symbol
 * @param checker
 */
export function getFunctionLikeSignature(symbol: ts.Symbol, checker: ts.TypeChecker): ts.Signature
{
	return checker.getSignaturesOfType(getType(symbol, checker), ts.SignatureKind.Call)[0];
}