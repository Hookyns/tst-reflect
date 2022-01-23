import * as ts                     from "typescript";
import { Context }                 from "./contexts/Context";
import { MethodDescriptionSource } from "./declarations";
import { getDecorators }           from "./getDecorators";
import { getTypeCall }             from "./getTypeCall";
import {
	getAccessModifier,
	getFunctionLikeSignature,
	getUnknownTypeCall
}                                  from "./helpers";

/**
 * Return methods of Type
 * @param symbol
 * @param type
 * @param context
 */
export function getMethods(symbol: ts.Symbol | undefined, type: ts.Type, context: Context): Array<MethodDescriptionSource> | undefined
{
	if (symbol?.members)
	{
		const members: Array<ts.Symbol> = Array.from(symbol.members.values() as any);

		const methods = members
			.filter(m => (m.flags & ts.SymbolFlags.Method) === ts.SymbolFlags.Method || (m.flags & ts.SymbolFlags.Function) === ts.SymbolFlags.Function)
			.map((memberSymbol: ts.Symbol) =>
			{
				const methodSignature = getFunctionLikeSignature(memberSymbol, context.typeChecker);
				const returnType = methodSignature?.getReturnType();

				// TODO: Finish this implementation of methods
				return {
					n: memberSymbol.escapedName.toString(),
					params: [],
					rt: returnType && getTypeCall(returnType, returnType.symbol, context) || getUnknownTypeCall(context),
					d: getDecorators(memberSymbol, context.typeChecker),
					tp: [],
					o: (memberSymbol.flags & ts.SymbolFlags.Optional) === ts.SymbolFlags.Optional,
					am: getAccessModifier(memberSymbol.valueDeclaration?.modifiers)
				};
			});

		return methods.length ? methods : undefined;
	}

	return undefined;
}