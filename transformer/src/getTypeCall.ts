import * as ts                   from "typescript";
import {
	GetTypeCall,
	TypeDescription,
	TypePropertiesSource
}                                from "./declarations";
import { createValueExpression } from "./createValueExpression";
import { getTypeDescription }    from "./getTypeDescription";
import { Context }               from "./contexts/Context";
import { getTypeId }             from "./helpers";

const createdTypes = new Map<number, ts.ObjectLiteralExpression>();

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
 * @param type
 * @param symbol
 * @param context
 * @param typeCtor
 */
export function getTypeCall(type: ts.Type, symbol: ts.Symbol | undefined, context: Context, typeCtor?: ts.EntityName | ts.DeclarationName): GetTypeCall // TODO: Remove symbol parameter if possible
{
	const id = getTypeId(type, context.typeChecker);
	let typeDescription: TypeDescription | undefined = undefined;

	if (!id || !createdTypes.has(id))
	{
		if (id)
		{
			// getType.lazy()
			if (creatingTypes.includes(id))
			{
				return context.metaWriter.factory.getTypeFromStoreLazily(id);
			}

			// insert type into the stack
			creatingTypes.push(id);
		}

		typeDescription = getTypeDescription(type, symbol, context, typeCtor);
		const typePropertiesObjectLiteral = createValueExpression(typeDescription.properties) as ts.ObjectLiteralExpression;

		if (id)
		{
			// remove type from the stack
			creatingTypes.pop();
			
			// Add metadata
			context.addTypeMetadata([id, typePropertiesObjectLiteral, typeDescription?.localType ?? false]);
			
			// Store created type
			createdTypes.set(id, typePropertiesObjectLiteral);
		}
	}

	if (id)
	{
		/**
		 * Just call `getType()` with typeId; Type is going to be loaded from storage
		 */
		return context.metaWriter.factory.getTypeFromStore(id);
	}

	/**
	 * Type is not registered (no id or no sourceFileContext) so direct type construction returned
	 */
	return context.metaWriter.factory.createDescriptionWithoutAddingToStore(typeDescription!.properties);
}

/**
 * Return call expression of runtime getType() with description of specified properties
 * @param properties
 * @param context
 */
export function getTypeCallFromProperties(properties: TypePropertiesSource, context: Context): GetTypeCall
{
	return context.metaWriter.factory.createDescriptionWithoutAddingToStore(properties);
}

