import * as ts                 from "typescript";
import { getNodeLocationText } from "./utils/getNodeLocationText";
import { getDeclaration }      from "./utils/symbolHelpers";
import { Context }             from "./contexts/Context";
import { DecoratorProperties } from "./declarations";
import { log }                 from "./log";
import { getTypeFullName }     from "./utils/typeHelpers";

export function getDecorators(symbol: ts.Symbol, context: Context): Array<DecoratorProperties> | undefined
{
	const declaration = getDeclaration(symbol);

	if (!declaration?.decorators)
	{
		return undefined;
	}

	const decorators: Array<DecoratorProperties> = [];

	for (let decorator of declaration.decorators)
	{
		const identifier = ts.isCallExpression(decorator.expression)
			? decorator.expression.getFirstToken()
			: ts.isIdentifier(decorator.expression)
				? decorator.expression
				: undefined;

		if (!identifier)
		{
			log.warn(`Identifier of some decorator on ${symbol.escapedName} not found.`);
			continue;
		}

		const decoratorSymbol = context.typeChecker.getSymbolAtLocation(identifier);
		const decoratorDeclaration = getDeclaration(decoratorSymbol);

		if (!decoratorDeclaration)
		{
			// TODO: Log in debug mode
			continue;
		}

		let decoratorType = context.typeChecker.getTypeOfSymbolAtLocation(decoratorSymbol!, decoratorDeclaration);
		let args: Array<any> = [];

		if (ts.isCallExpression(decorator.expression))
		{
			for (let arg of decorator.expression.arguments)
			{
				const type = context.typeChecker.getTypeAtLocation(arg);

				if (type.isLiteral())
				{
					args.push(type.value);
				}
				else if (type.flags & ts.TypeFlags.BooleanLiteral)
				{
					args.push((type as any).intrinsicName === "true");
				}
				else
				{
					log.warn("Unexpected decorator argument. Only constant values are allowed.\n\tAt " + getNodeLocationText(arg));
					args.push(ts.factory.createNull());
				}
			}
		}

		decorators.push({
			name: decoratorSymbol!.escapedName.toString(),
			fullName: getTypeFullName(decoratorType, context),
			args: args.length == 0 ? undefined : args
		});
	}

	return decorators.length == 0 ? undefined : decorators;
}