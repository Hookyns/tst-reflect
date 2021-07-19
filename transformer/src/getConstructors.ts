import * as ts                        from "typescript";
import {ConstructorDescriptionSource} from "./declarations";
import {getType}                      from "./helpers";
import getTypeCall                    from "./getTypeCall";
import {Context}                      from "./visitors/Context";

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

			params.push({
				n: paramSymbol.getName(),
				t: getTypeCall(paramType, paramSymbol, context)
			});
		}

		constructors.push({
			params: params
		})
	}

	return constructors.length ? constructors : undefined;
}