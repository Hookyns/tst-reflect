import * as ts     from "typescript";
import * as path   from "path";
import {TypeKind}  from "tst-reflect";
import {getConfig} from "./config";

const rootDir = getConfig().rootDir;

/**
 * Name of parameter for method/function declarations containing geneic getType() calls
 */
export const GENERIC_PARAMS = "__genericParams__";

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

	return checker.getTypeOfSymbolAtLocation(symbol, symbol.declarations[0]);
}

/**
 * Get Kind of type
 * @param symbol
 */
export function getTypeKind(symbol: ts.Symbol)
{
	if (symbol.flags == ts.SymbolFlags.Class)
	{
		return TypeKind.Class;
	}

	if (symbol.flags == ts.SymbolFlags.Interface)
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
		return undefined;
	}

	let filePath = typeSymbol.declarations[0].getSourceFile().fileName;

	if (rootDir)
	{
		filePath = path.join(path.relative(filePath, rootDir), path.basename(filePath));
	}

	return filePath + ":" + typeSymbol.getName()
}

/**
 * Check that Type is native type (string, number, boolean, ...)
 * @param type
 */
export function isNativeType(type: ts.Type)
{
	return (type as any)["intrinsicName"] !== undefined;

	// const flag = type.getFlags();
	//
	// return [
	// 	ts.TypeFlags.String
	// ].includes(flag);
}

/**
 * Check that value is TS Expression
 * @param value
 */
export function isExpression(value: any)
{
	return value.hasOwnProperty("kind") && (value.constructor.name == "NodeObject" || value.constructor.name == "IdentifierObject");
}