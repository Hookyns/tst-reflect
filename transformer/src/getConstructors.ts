import * as ts                          from "typescript";
import { ConstructorDescriptionSource } from "./declarations";
import { getType }                      from "./helpers";
import { getTypeCall }                  from "./getTypeCall";
import { Context }                      from "./contexts/Context";

export function getConstructors(type: ts.Type, context: Context)
{
	const constructors: Array<ConstructorDescriptionSource> = [];
	const ctors = type.getConstructSignatures();
	let paramSymbol: ts.Symbol, paramType: ts.Type | undefined = undefined;

	for (let ctor of ctors)
	{
		const params = [];

		for (paramSymbol of ctor.parameters)
		{
			paramType = getType(paramSymbol, context.typeChecker);
			const declaration = paramSymbol.valueDeclaration as ts.ParameterDeclaration;

			params.push({
				n: paramSymbol.getName(),
				t: getTypeCall(paramType, paramSymbol, context),
				o: declaration.questionToken !== undefined || declaration.initializer !== undefined
			});
		}

		constructors.push({
			params: params
		});
	}

	return constructors.length ? constructors : undefined;
}
