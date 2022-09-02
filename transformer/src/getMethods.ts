import * as ts                    from "typescript";
import { Context }                from "./contexts/Context";
import {
	GetTypeCall,
	MethodDescriptionSource
}                                 from "./declarations";
import { getDecorators }          from "./getDecorators";
import { getSignatureParameters } from "./getSignatureParameters";
import { getTypeCall }            from "./getTypeCall";
import {
	getAccessModifier,
	getDeclaration,
	getFunctionLikeSignature,
	getUnknownTypeCall,
}                                 from "./helpers";

export function getMethodGenerics(symbol: ts.Symbol, context: Context): Array<GetTypeCall>
{
	const value = symbol?.valueDeclaration as ts.MethodDeclaration;

	return (value?.typeParameters ?? []).map(generic => {
		const type = context.typeChecker.getTypeAtLocation(generic);
		return getTypeCall(type, symbol, context);
	});
}

function getMethodDescriptionFromSignature(symbol: ts.Symbol, methodSignature: ts.Signature, context: Context)
{
	const returnType = methodSignature.getReturnType();

	return {
		n: symbol.escapedName.toString(),
		params: getSignatureParameters(methodSignature, context),
		rt: getTypeCall(returnType, returnType.symbol, context) || getUnknownTypeCall(context),
		d: getDecorators(symbol, context),
		tp: methodSignature.getTypeParameters()?.map(typeParameter => getTypeCall(typeParameter, typeParameter.symbol, context)) ?? [], //getMethodGenerics(symbol, context),
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

	const members = type.getProperties();

	const methods = members
		.filter(m => (m.flags & ts.SymbolFlags.Method) === ts.SymbolFlags.Method || (m.flags & ts.SymbolFlags.Function) === ts.SymbolFlags.Function)
		.flatMap(
			(memberSymbol: ts.Symbol) => {
				const declaration = getDeclaration(memberSymbol);

				if (!declaration)
				{
					return [];
				}
				
				let type = context.typeChecker.getTypeOfSymbolAtLocation(memberSymbol, declaration);
				
				if (type.isUnion()) 
				{
					type = (type.types[0].flags === ts.TypeFlags.Undefined ? type.types[1] : type.types[0]) || type;
				}
				
				return type.getCallSignatures().map(signature => getMethodDescriptionFromSignature(memberSymbol, signature, context));
			}
		);

	return methods.length ? methods : undefined;
}
