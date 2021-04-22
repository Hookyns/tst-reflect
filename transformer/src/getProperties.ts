import * as ts                                        from "typescript";
import {getType}                                      from "./helpers";
import getTypeCall                                    from "./getTypeCall";
import {PropertyDescriptionSource, SourceFileContext} from "./declarations";
import {getDecorators}                                from "./getDecorators";

/**
 * Return properties of type
 * @param symbol
 * @param type
 * @param checker
 * @param sourceFileContext
 */
export function getProperties(symbol: ts.Symbol | undefined, type: ts.Type, checker: ts.TypeChecker, sourceFileContext: SourceFileContext): Array<PropertyDescriptionSource> | undefined
{
	if (symbol?.members)
	{
		const members: Array<ts.Symbol> = Array.from(symbol.members.values() as any);

		const properties = members
			.filter(m => m.flags == ts.SymbolFlags.Property || m.flags == ts.SymbolFlags.GetAccessor)
			.map((memberSymbol: ts.Symbol) => {
				return {
					n: memberSymbol.escapedName.toString(),
					t: getTypeCall(getType(memberSymbol, checker), memberSymbol, checker, sourceFileContext),
					d: getDecorators(memberSymbol, checker)
				};
			});

		return properties.length ? properties : undefined;
	}
	
	// If type is Array
	const resolvedTypeArguments: Array<ts.Type> = (type as any).resolvedTypeArguments;
	
	if (resolvedTypeArguments)
	{
		const properties = resolvedTypeArguments.map((type: ts.Type, index: number) => {
				return {
					n: index.toString(),
					t: getTypeCall(type, undefined, checker, sourceFileContext)
				};
			});

		return properties.length ? properties : undefined;
	}

	return undefined;
}