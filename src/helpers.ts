import {TypeKind}  from "../types";
import * as ts     from "typescript";
import * as path   from "path";
import {getConfig} from "./config";

const rootDir = getConfig().rootDir;

export function getType(symbol: ts.Symbol, checker: ts.TypeChecker): ts.Type
{
	return checker.getTypeOfSymbolAtLocation(symbol, symbol.declarations[0]);
}

export function getSymbol(node: ts.Node, checker: ts.TypeChecker): ts.Symbol | undefined
{
	let name;

	if ((node as any)["typeName"] != undefined)
	{
		name = (node as any).typeName;
	}

	if ((node as any)["getName"] != undefined)
	{
		name = (node as any).getName();

	}

	return checker.getSymbolAtLocation(name);
}

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

export function getTypeFullName(type: ts.Type, typeSymbol?: ts.Symbol)
{
	typeSymbol = typeSymbol || type.getSymbol();
	
	if (!typeSymbol) {
		return undefined;
	}
	
	let filePath = typeSymbol.declarations[0].getSourceFile().fileName;
	
	if (rootDir) {
		filePath = path.join(path.relative(filePath, rootDir), path.basename(filePath));
	}
	
	return filePath + ":" + typeSymbol.getName()
}

export function isNativeType(type: ts.Type)
{
	return (type as any)["intrinsicName"] !== undefined;

	// const flag = type.getFlags();
	//
	// return [
	// 	ts.TypeFlags.String
	// ].includes(flag);
}

export function isExpression(value: any)
{
	return value.hasOwnProperty("kind") && value.constructor.name == "NodeObject";
}