import * as ts                        from "typescript";
import { Context }                    from "./contexts/Context";
import { ParameterDescriptionSource } from "./declarations";
import { getTypeCall }                from "./getTypeCall";
import {
	getCtorTypeReference,
	getDeclaration,
	getType,
	getUnknownTypeCall
}                                     from "./helpers";

/**
 * Process the signature of the method and create a parameter description for each parameter
 *
 * @param {ts.Signature} signature
 * @param {Context} context
 * @returns {Array<ParameterDescriptionSource>}
 */
export function getSignatureParameters(signature: ts.Signature, context: Context): Array<ParameterDescriptionSource>
{
	const signatureParameters = signature.getParameters();

	if (!signature || !signatureParameters?.length)
	{
		return [];
	}

	const parameters: Array<ParameterDescriptionSource> = [];

	for (let parameterSymbol of signatureParameters)
	{
		const declaration = getDeclaration(parameterSymbol) as ts.ParameterDeclaration;
		const type = getType(parameterSymbol, context.typeChecker);

		parameters.push({
			n: parameterSymbol.getName(),
			t: type && getTypeCall(type, type.symbol, context, getCtorTypeReference(parameterSymbol)) || getUnknownTypeCall(context),
			o: declaration.questionToken !== undefined || declaration.initializer !== undefined || declaration.dotDotDotToken !== undefined,
			var: !!declaration?.dotDotDotToken,
			dv: type?.isClass() ? null /*TODO: handle class, but how ? */ : declaration.initializer,
		});
	}

	return parameters;
}