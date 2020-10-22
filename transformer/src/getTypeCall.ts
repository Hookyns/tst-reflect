import * as ts                          from "typescript";
import {GetTypeCall, SourceFileContext} from "./declarations";
import {createValueExpression}          from "./createValueExpression";
import {getTypeDescription}             from "./getTypeDescription";

const createdTypes: Map<number, ts.ObjectLiteralExpression> = new Map<number, ts.ObjectLiteralExpression>();

/**
 * Return call expression of runtime getType() with description and/or type id
 * @param symbol
 * @param type
 * @param checker
 * @param sourceFileContext
 * @param typeCtor
 */
export default function getTypeCall(symbol: ts.Symbol | undefined, type: ts.Type, checker: ts.TypeChecker, sourceFileContext: SourceFileContext, typeCtor?: ts.EntityName): GetTypeCall
{
	const id: number | undefined = (type.symbol as any)?.["id"];
	let typePropertiesObjectLiteral: ts.ObjectLiteralExpression | undefined = undefined;

	if (id)
	{
		typePropertiesObjectLiteral = createdTypes.get(id);
	}

	if (!typePropertiesObjectLiteral)
	{
		const props = getTypeDescription(symbol, type, checker, sourceFileContext, typeCtor);
		typePropertiesObjectLiteral = createValueExpression(props) as ts.ObjectLiteralExpression;
	}

	if (id && sourceFileContext)
	{
		sourceFileContext.typesProperties[id] = typePropertiesObjectLiteral;

		// Just call getType() with typeId; Type is gonna be take from storage
		return ts.factory.createCallExpression(sourceFileContext?.getTypeIdentifier!, [], [ts.factory.createNumericLiteral(id)]);
	}

	// Type is not registered (no Id or no sourceFileContext) so direct type construction returned
	return ts.factory.createCallExpression(sourceFileContext?.getTypeIdentifier!, [], [typePropertiesObjectLiteral]);
}