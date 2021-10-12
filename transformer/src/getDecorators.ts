import * as ts                        from "typescript";
import { DecoratorDescriptionSource } from "./declarations";
import { getTypeFullName }            from "./helpers";

export function getDecorators(symbol: ts.Symbol, checker: ts.TypeChecker): Array<DecoratorDescriptionSource> | undefined
{

	if (!symbol.valueDeclaration?.decorators)
	{
		return undefined;
	}

	const decorators: Array<DecoratorDescriptionSource> = [];

	for (let decorator of symbol.valueDeclaration.decorators)
	{
		const firstToken = decorator.expression.getFirstToken();

		if (!firstToken)
		{
			continue;
		}

		const symbol = checker.getSymbolAtLocation(firstToken);

		if (!symbol || !symbol.valueDeclaration)
		{
			// TODO: Log in debug mode
			continue;
		}

		let decoratorType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);

		decorators.push({
			n: symbol.escapedName.toString(),
			fn: getTypeFullName(decoratorType)
		});
	}

	return decorators.length == 0 ? undefined : decorators;
}