import * as path          from "path";
import {
	REFLECT_GENERIC_DECORATOR,
	TypeKind
}                         from "tst-reflect";
import * as ts            from "typescript";
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

	if (!symbol.declarations)
	{
		throw new Error("Unable to resolve declarations of symbol.");
	}

	return checker.getTypeOfSymbolAtLocation(symbol, symbol.declarations[0]);
}

/**
 * Get Kind of type
 * @param symbol
 */
export function getTypeKind(symbol: ts.Symbol)
{
	if ((symbol.flags & ts.SymbolFlags.Class) == ts.SymbolFlags.Class)
	{
		return TypeKind.Class;
	}

	if ((symbol.flags & ts.SymbolFlags.Interface) == ts.SymbolFlags.Interface)
	{
		return TypeKind.Interface;
	}

	throw new Error("Unknown type kind");
}

/**
 * Get full name of type
 * @param type
 * @param typeSymbol
 */
export function getTypeFullName(type: ts.Type, typeSymbol?: ts.Symbol)
{
	typeSymbol = typeSymbol || type.getSymbol();

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

	const root = TransformerContext.instance.config.rootDir;
	let filePath = typeSymbol.declarations[0].getSourceFile().fileName;

	if (root)
	{
		filePath = path.join(path.relative(filePath, root), path.basename(filePath));
	}

	return filePath + ":" + typeSymbol.getName();
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
 * @param fncType
 */
export function hasReflectJsDoc(fncType: ts.Type): boolean
{
	const symbol = fncType.getSymbol();

	if (!symbol)
	{
		return false;
	}

	// If declaration contains @reflectGeneric in JSDoc comment, pass all generic arguments
	return symbol.getJsDocTags().some(tag => tag.name === REFLECT_GENERIC_DECORATOR);
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
export function createCtorGetter(typeCtor: ts.EntityName | undefined)
{
	if (!typeCtor)
	{
		return undefined;
	}

	return ts.factory.createArrowFunction(undefined, undefined, [], undefined, ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken), typeCtor as ts.Expression);
}