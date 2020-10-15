﻿import * as ts                     from "typescript";
import {DecoratorDescriptionSource} from "./declarations";
import {getTypeFullName}            from "./helpers";

export function getDecorators(symbol: ts.Symbol, checker: ts.TypeChecker): Array<DecoratorDescriptionSource> | undefined
{
	const decorators: Array<DecoratorDescriptionSource> = [];

	if (symbol.valueDeclaration?.decorators)
	{
		for (let decorator of symbol.valueDeclaration?.decorators)
		{
			const firstToken = decorator.expression.getFirstToken();

			if (!firstToken)
			{
				continue;
			}

			const symbol = checker.getSymbolAtLocation(firstToken);

			if (!symbol)
			{
				continue;
			}

			let decoratorType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);

			// let callSignatures = decoratorType.getCallSignatures();
			// let details = serializeSymbol(symbol);
			// details.constructors = callSignatures.map(serializeSignature);

			decorators.push({
				n: symbol.escapedName.toString(),
				fn: getTypeFullName(decoratorType)
			});
		}
	}

	return decorators.length == 0 ? undefined : decorators;
}