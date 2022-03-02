import * as ts            from "typescript";
import { Context }        from "../contexts/Context";
import {
	AnyTypeReference,
	ParameterProperties,
	UnknownTypeReference
}                         from "../declarations";
import {
	getType
}                         from "../helpers";
import { getDeclaration } from "../utils/symbolHelpers";

/**
 * Process the signature of the method and create a parameter description for each parameter
 *
 * @param signature
 * @param context
 */
export function getSignatureParameters(signature: ts.Signature, context: Context): Array<ParameterProperties>
{
	const signatureParameters = signature.getParameters();

	if (!signature || !signatureParameters?.length)
	{
		return [];
	}

	const parameters: Array<ParameterProperties> = [];

	for (let parameterSymbol of signatureParameters)
	{
		const declaration = getDeclaration<ts.ParameterDeclaration>(parameterSymbol);
		const type = getType(parameterSymbol, context);

		if (declaration) {
			parameters.push({
				name: parameterSymbol.getName(),
				type: declaration.type === undefined ? AnyTypeReference : (context.metadata.addType(declaration.type, type) || UnknownTypeReference),
				optional: declaration.questionToken !== undefined || declaration.initializer !== undefined,
			});
		}
		else {
			
		}
	}

	return parameters;
}