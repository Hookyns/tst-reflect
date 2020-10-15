﻿import * as ts                                       from "typescript";
import {getType}                                      from "./helpers";
import getTypeCall                                    from "./getTypeCall";
import {PropertyDescriptionSource, SourceFileContext} from "./declarations";

export function getProperties(symbol: ts.Symbol | undefined, checker: ts.TypeChecker, sourceFileContext: SourceFileContext): Array<PropertyDescriptionSource> | undefined
{
	if (symbol?.members)
	{
		const members: Array<ts.Symbol> = Array.from(symbol.members.values() as any);

		const properties = members
			.filter(m => m.flags == ts.SymbolFlags.Property || m.flags == ts.SymbolFlags.GetAccessor)
			.map((memberSymbol: ts.Symbol) => ({
				n: memberSymbol.escapedName.toString(),
				t: getTypeCall(memberSymbol, getType(memberSymbol, checker), checker, sourceFileContext)
			}));

		return properties.length ? properties : undefined;
	}

	return undefined;
}