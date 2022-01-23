import * as ts                    from "typescript";
import { GET_TYPE_LAZY_FNC_NAME } from "tst-reflect";
import {
	GetTypeCall,
	TypePropertiesSource
} from "./declarations";
import { createValueExpression }  from "./createValueExpression";
import { getTypeDescription }     from "./getTypeDescription";
import { Context }                from "./contexts/Context";

const createdTypes: Map<number, ts.ObjectLiteralExpression> = new Map<number, ts.ObjectLiteralExpression>();

/**
 * This is an Stack for storing Ids of currently constructing type descriptions.
 * It is important cuz of circular type references, eg:
 * class Foo {
 *     foo(): Foo {
 *         return this;
 *     }
 * }
 * So we will pre-register id of type and return getType(id) for all nested calls
 * @type {any[]}
 */
const creatingTypes: Array<number> = [];

/**
 * Return call expression of runtime getType() with description and/or type id
 * @param symbol
 * @param type
 * @param context
 * @param typeCtor
 */
export function getTypeCall(type: ts.Type, symbol: ts.Symbol | undefined, context: Context, typeCtor?: ts.EntityName | ts.DeclarationName): GetTypeCall
{
	const id: number | undefined = (type.symbol as any)?.["id"];
	let typePropertiesObjectLiteral: ts.ObjectLiteralExpression | undefined = undefined;

	if (id)
	{
		typePropertiesObjectLiteral = createdTypes.get(id);
	}

	const getTypeIdentifier = context.getGetTypeIdentifier();

	if (!typePropertiesObjectLiteral)
	{
		if (id)
		{
			if (creatingTypes.includes(id))
			{
				// getType.lazy()
				return ts.factory.createCallExpression(
					ts.factory.createPropertyAccessExpression(getTypeIdentifier, GET_TYPE_LAZY_FNC_NAME),
					[],
					[ts.factory.createNumericLiteral(id)]
				);
			}

			creatingTypes.push(id);
		}

		const props = getTypeDescription(type, symbol, context, typeCtor);
		typePropertiesObjectLiteral = createValueExpression(props) as ts.ObjectLiteralExpression;

		if (id)
		{
			creatingTypes.pop();
		}
	}

	if (id)
	{
		context.addTypeMetadata([id, typePropertiesObjectLiteral]);
		createdTypes.set(id, typePropertiesObjectLiteral);

		// Just call getType() with typeId; Type is gonna be take from storage
		return ts.factory.createCallExpression(getTypeIdentifier, [], [ts.factory.createNumericLiteral(id)]);
	}

	// Type is not registered (no Id or no sourceFileContext) so direct type construction returned
	return ts.factory.createCallExpression(getTypeIdentifier, [], [typePropertiesObjectLiteral]);
}

/**
 * Return call expression of runtime getType() with description of specified properties
 * @param properties
 * @param context
 */
export function getTypeCallFromProperties(properties: TypePropertiesSource, context: Context): GetTypeCall
{
	const getTypeIdentifier = context.getGetTypeIdentifier();
	return ts.factory.createCallExpression(getTypeIdentifier, [], [createValueExpression(properties)]);
}