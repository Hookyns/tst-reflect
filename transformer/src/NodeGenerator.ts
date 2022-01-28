import {
	Expression,
	ImportDeclaration,
	ObjectLiteralElementLike
}                                             from "typescript";
import * as ts                                from "typescript";
import { log }                                from "./log";

class NodeGenerator
{
	/**
	 * Generate statement importing getType() from "tst-reflect"
	 */
	createGetTypeImport(getTypeIdentifier?: ts.Identifier): { statement: ts.Statement, getTypeIdentifier: ts.Identifier }
	{
		getTypeIdentifier ??= ts.factory.createIdentifier("_tst_getType");

		const statement = ts.factory.createVariableStatement(
			undefined,
			[
				// const _tst_getType = require("tst-reflect").getType;
				ts.factory.createVariableDeclaration(
					getTypeIdentifier,
					undefined,
					undefined,
					ts.factory.createPropertyAccessExpression(
						ts.factory.createCallExpression(
							ts.factory.createIdentifier("require"),
							undefined,
							[
								ts.factory.createStringLiteral("tst-reflect")
							]
						),
						ts.factory.createIdentifier("getType")
					)
				)
			]
		);

		return {
			statement,
			getTypeIdentifier
		};
	}

	createImport(importInformation: { filePath: string, isDefault?: boolean, identifier: string | ts.Identifier, isTypeOnlyImport?: boolean }): ImportDeclaration
	{
		const identifier = typeof importInformation.identifier === 'string'
			? ts.factory.createIdentifier(importInformation.identifier)
			: importInformation.identifier;

		if (importInformation?.isDefault === true)
		{
			return ts.factory.createImportDeclaration(
				undefined,
				undefined,
				ts.factory.createImportClause(
					importInformation?.isTypeOnlyImport === true,
					identifier,
					undefined
				),
				ts.factory.createStringLiteral(importInformation.filePath)
			);
		}

		return ts.factory.createImportDeclaration(
			undefined,
			undefined,
			ts.factory.createImportClause(
				false, undefined,
				ts.factory.createNamedImports([
					ts.factory.createImportSpecifier(
						importInformation?.isTypeOnlyImport === true,
						undefined,
						identifier
					)
				])
			),
			ts.factory.createStringLiteral(importInformation.filePath)
		);
	}

	/**
	 * Create a factory type object from an input object
	 *
	 * @param data
	 * @returns {ts.ObjectLiteralExpression}
	 */
	createObjectLiteralExpressionNode(data: any): ts.ObjectLiteralExpression
	{
		const props: ObjectLiteralElementLike[] = [];

		for (let key of Object.keys(data))
		{
			const value = data[key];

			let valueNode: Expression | undefined = undefined;

			switch (typeof value)
			{
				case "object":
					valueNode = this.createObjectLiteralExpressionNode(value);
					break;
				case "string":
					valueNode = ts.factory.createStringLiteral(value);
					break;
				case "boolean":
					valueNode = value ? ts.factory.createTrue() : ts.factory.createFalse();
					break;
				case "number":
					valueNode = ts.factory.createNumericLiteral(value);
					break;
			}

			if (!valueNode)
			{
				log.warn(`Failed to create node for objectLiteralExpressionNode. Value: `, value);
				continue;
			}

			props.push(
				ts.factory.createPropertyAssignment(ts.factory.createIdentifier(key), valueNode)
			);
		}

		return ts.factory.createObjectLiteralExpression(props, true);
	}
}

export const nodeGenerator = new NodeGenerator();
