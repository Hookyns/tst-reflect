import * as ts                    from "typescript";
import { Context }                from "../contexts/Context";
import {
	MethodProperties
} from "../declarations";

// export function getMethodGenerics(symbol: ts.Symbol, context: Context): Array<MethodProperties>
// {
// 	const value = symbol?.valueDeclaration as ts.MethodDeclaration;
//
// 	return (value?.typeParameters ?? []).map(generic => {
// 		const type = context.typeChecker.getTypeAtLocation(generic);
// 		return getTypeCall(type, symbol, context);
// 	});
// }
//
// /**
//  * Extracted to its own method, hopefully we should be able to use
//  * this for other method descriptions, than just a class method
//  *
//  * @param {ts.Symbol} symbol
//  * @param {Context} context
//  * @returns {MethodProperties}
//  */
// export function getMethodProperties(symbol: ts.Symbol, context: Context): MethodProperties
// {
// 	const methodSignature = getFunctionLikeSignature(symbol, context);
// 	const returnType = methodSignature?.getReturnType();
//
// 	// TODO: Finish this implementation of methods
// 	return {
// 		n: symbol.escapedName.toString(),
// 		params: methodSignature && getSignatureParameters(methodSignature, context),
// 		rt: returnType && getTypeCall(returnType, returnType.symbol, context) || UnknownTypeReference,
// 		d: getDecorators(symbol, context),
// 		tp: getMethodGenerics(symbol, context),
// 		o: (symbol.flags & ts.SymbolFlags.Optional) === ts.SymbolFlags.Optional,
// 		am: getAccessModifier(symbol.valueDeclaration?.modifiers)
// 	};
// }

/**
 * Return methods of Type
 * @param context
 * @param type
 */
export function getMethods(context: Context, type: ts.Type): Array<MethodProperties> | undefined
{
	// if (!symbol?.members)
	// {
	// 	return undefined;
	// }

	const signature = type.getCallSignatures();

	// TODO: Methods
	// const members: Array<ts.Symbol> = Array.from(symbol.members.values() as any);
	//
	// const methods = members
	// 	.filter(m => (m.flags & ts.SymbolFlags.Method) === ts.SymbolFlags.Method || (m.flags & ts.SymbolFlags.Function) === ts.SymbolFlags.Function)
	// 	.map((memberSymbol: ts.Symbol) => getMethodDescription(memberSymbol, context));
	//
	// return methods.length ? methods : undefined;

	return undefined;
}
