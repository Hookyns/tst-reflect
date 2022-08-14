import * as ts                    from "typescript";
import { Context }                from "./contexts/Context";
import { IndexDescriptionSource } from "./declarations";
import { getTypeCall }            from "./getTypeCall";
import {
	getCtorTypeReference,
	getSymbol,
}                                 from "./helpers";

/**
 * Return indexes of type.
 * @param type
 * @param context
 */
export function getIndexes(type: ts.Type, context: Context): Array<IndexDescriptionSource> | undefined
{
	return context.typeChecker.getIndexInfosOfType(type)
		.map((indexInfo: ts.IndexInfo) => {
			const keySymbol = getSymbol(indexInfo.keyType);
			const typeSymbol = getSymbol(indexInfo.type);

			return {
				k: getTypeCall(indexInfo.keyType, keySymbol, context, getCtorTypeReference(keySymbol)),
				t: getTypeCall(indexInfo.type, typeSymbol, context, getCtorTypeReference(typeSymbol)),
				ro: indexInfo.isReadonly
			};
		});
}
