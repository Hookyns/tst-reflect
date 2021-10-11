import * as ts from "typescript";

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
			]);

		return {
			statement,
			getTypeIdentifier
		}
	}
	
	/**
	 * Generate statement importing type constructor
	 */
	createCtorImport(ctor: ts.EntityName):  ts.Statement
	{
		const statement = ts.factory.createVariableStatement(
			undefined,
			[
				ts.factory.createVariableDeclaration(
					ts.factory.createIdentifier(ctor.getText()),
					undefined,
					undefined,
					ts.factory.createNull()
				)
			]);

		return statement;
	}
}

export const nodeGenerator = new NodeGenerator();