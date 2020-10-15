﻿import * as ts                                          from "typescript";
import {ConstructorDescriptionSource, SourceFileContext} from "./declarations";
import {getType}                                         from "./helpers";
import getTypeCall                                       from "./getTypeCall";

export function getConstructors(type: ts.Type, checker: ts.TypeChecker, sourceFileContext: SourceFileContext)
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
				t: getTypeCall(paramSymbol, paramType, checker, sourceFileContext)
			});
		}

		constructors.push({
			params: params
		})
	}

	return constructors.length ? constructors : undefined;
}