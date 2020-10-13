import * as ts                        from "typescript";
import {ConstructorDescriptionSource} from "../types";
import {getType}                      from "./helpers";
import createNewType                  from "./createNewType";

export function getConstructors(type: ts.Type, checker: ts.TypeChecker)
{
	const constructors: Array<ConstructorDescriptionSource> = [];
	const ctors = type.getConstructSignatures();
	let paramSymbol: ts.Symbol, paramType: ts.Type | undefined = undefined;

	for (let ctor of ctors)
	{
		const params = [];

		for (paramSymbol of ctor.parameters)
		{
			paramType = getType(paramSymbol, checker);

			params.push({
				n: paramSymbol.getName(),
				t: createNewType(paramSymbol, paramType, checker)
			});
		}

		constructors.push({
			params: params
		})
	}

	return constructors.length ? constructors : undefined;
}