import * as ts                     from "typescript";
import {getType}                   from "./helpers";
import createNewType               from "./createNewType";
import {PropertyDescriptionSource} from "../types";

export function getProperties(symbol: ts.Symbol | undefined, checker: ts.TypeChecker): Array<PropertyDescriptionSource> | undefined
{
	if (symbol?.members)
	{
		const members: Array<ts.Symbol> = Array.from(symbol.members.values() as any);

		const properties = members
			.filter(m => m.flags == ts.SymbolFlags.Property || m.flags == ts.SymbolFlags.GetAccessor)
			.map((memberSymbol: ts.Symbol) => ({
				n: memberSymbol.escapedName.toString(),
				t: createNewType(memberSymbol, getType(memberSymbol, checker), checker)
			}));
		
		return properties.length ? properties : undefined;
	}

	return undefined;
}