import * as ts                   from "typescript";
import { GetTypeCall }           from "./declarations";
import { createValueExpression } from "./createValueExpression";
import { getTypeDescription }    from "./getTypeDescription";
import { Context }               from "./contexts/Context";

const createdTypes: Map<number, ts.ObjectLiteralExpression> = new Map<number, ts.ObjectLiteralExpression>();

/**
 * Return call expression of runtime getType() with description and/or type id
 * @param symbol
 * @param type
 * @param context
 * @param typeCtor
 */
export default function getTypeCall(type: ts.Type, symbol: ts.Symbol | undefined, context: Context, typeCtor?: ts.EntityName | ts.DeclarationName): GetTypeCall
{
	const id: number | undefined = (type.symbol as any)?.["id"];
	let typePropertiesObjectLiteral: ts.ObjectLiteralExpression | undefined = undefined;

	if (id)
	{
		typePropertiesObjectLiteral = createdTypes.get(id);
	}

	if (!typePropertiesObjectLiteral)
	{
		const props = getTypeDescription(type, symbol, context, typeCtor);
		typePropertiesObjectLiteral = createValueExpression(props) as ts.ObjectLiteralExpression;
	}

	const getTypeIdentifier = context.getGetTypeIdentifier();

	if (id)
	{
		context.addTypeMetadata([id, typePropertiesObjectLiteral]);
		// sourceFileContext.typesMetadata.push([id, typePropertiesObjectLiteral]);

		// Just call getType() with typeId; Type is gonna be take from storage
		return ts.factory.createCallExpression(getTypeIdentifier, [], [ts.factory.createNumericLiteral(id)]);
	}

	// Type is not registered (no Id or no sourceFileContext) so direct type construction returned
	return ts.factory.createCallExpression(getTypeIdentifier, [], [typePropertiesObjectLiteral]);
}