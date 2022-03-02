import * as ts                        from "typescript";
import { ConstructorProperties }      from "../declarations";
import { getSignatureParameters }     from "./getSignatureParameters";
import { Context }                    from "../contexts/Context";

export function getConstructors(type: ts.Type, context: Context): ConstructorProperties[] | undefined
{
	const constructors: Array<ConstructorProperties> = [];
	const ctors = type.getConstructSignatures();

	for (let ctorSignature of ctors)
	{
		constructors.push({
			parameters: getSignatureParameters(ctorSignature, context)
		});
	}

	return constructors.length ? constructors : undefined;
}
