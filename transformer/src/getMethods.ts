import * as ts                 from "typescript";
import { Context }             from "./contexts/Context";
import {
	GetTypeCall,
	MethodDescriptionSource
}                              from "./declarations";
import { getDecorators }          from "./getDecorators";
import { getSignatureParameters } from "./getSignatureParameters";
import { getTypeCall }            from "./getTypeCall";
import {
	getAccessModifier,
	getFunctionLikeSignature,
	getUnknownTypeCall,
}                              from "./helpers";

export function getMethodGenerics(symbol: ts.Symbol, context: Context): Array<GetTypeCall>
{
	const value = symbol?.valueDeclaration as ts.MethodDeclaration;

	return (value?.typeParameters ?? []).map(generic => {
		const type = context.typeChecker.getTypeAtLocation(generic);
		return getTypeCall(type, symbol, context);
	});
}

/**
 * Extracted to its own method, hopefully we should be able to use
 * this for other method descriptions, than just a class method
 *
 * @param {ts.Symbol} symbol
 * @param {Context} context
 * @returns {MethodDescriptionSource}
 */
export function getMethodDescription(symbol: ts.Symbol, context: Context): MethodDescriptionSource
{
	const methodSignature = getFunctionLikeSignature(symbol, context.typeChecker);
	const returnType = methodSignature?.getReturnType();

	// TODO: Finish this implementation of methods
	return {
		n: symbol.escapedName.toString(),
		params: methodSignature && getSignatureParameters(methodSignature, context),
		rt: returnType && getTypeCall(returnType, returnType.symbol, context) || getUnknownTypeCall(context),
		d: getDecorators(symbol, context.typeChecker),
		tp: getMethodGenerics(symbol, context),
		o: (symbol.flags & ts.SymbolFlags.Optional) === ts.SymbolFlags.Optional,
		am: getAccessModifier(symbol.valueDeclaration?.modifiers)
	};
}

/**
 * Return methods of Type
 * @param symbol
 * @param type
 * @param context
 */
export function getMethods(symbol: ts.Symbol | undefined, type: ts.Type, context: Context): Array<MethodDescriptionSource> | undefined
{
	if (!symbol?.members)
	{
		return undefined;
	}

	const members: Array<ts.Symbol> = Array.from(symbol.members.values() as any);

	const methods = members
		.filter(m => (m.flags & ts.SymbolFlags.Method) === ts.SymbolFlags.Method || (m.flags & ts.SymbolFlags.Function) === ts.SymbolFlags.Function)
		.map((memberSymbol: ts.Symbol) => getMethodDescription(memberSymbol, context));

	return methods.length ? methods : undefined;
}
