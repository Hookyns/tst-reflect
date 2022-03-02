import * as ts from "typescript";

/**
 * Returns declaration of symbol. ValueDeclaration is preferred.
 * @param symbol
 */
export function getDeclaration<TDeclaration extends ts.Declaration = ts.Declaration>(symbol?: ts.Symbol): TDeclaration | undefined
{
	if (!symbol)
	{
		return undefined;
	}

	return (symbol.valueDeclaration || symbol.declarations?.[0]) as TDeclaration | undefined; // TODO: Check valueDeclaration vs declaration
}