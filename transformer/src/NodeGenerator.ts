import * as ts from "typescript";
import TransformerContext from "./contexts/TransformerContext";
import { log } from "./log";

export type ImportInformation = {
	filePath: string;
	isDefault?: boolean;
	identifier: string | ts.Identifier;
	isTypeOnlyImport?: boolean;
	namespaceImport?: boolean
};

class NodeGenerator
{
	/**
	 * Generate statement importing getType() from "tst-reflect"
	 */
	createGetTypeImport(getTypeIdentifier?: ts.Identifier): { statement: ts.Statement, getTypeIdentifier: ts.Identifier }
	{
		getTypeIdentifier ??= ts.factory.createIdentifier("_tst_getType");
		const packageName = ts.factory.createStringLiteral("tst-reflect");
		const getTypeExportNameIdentifier = ts.factory.createIdentifier("getType");

		const statement: ts.Statement = /*TransformerContext.instance.config.esmModuleKind
			? */ts.factory.createImportDeclaration(
				undefined,
				undefined,
				ts.factory.createImportClause(
					false, undefined,
					ts.factory.createNamedImports([
						ts.factory.createImportSpecifier(
							false,
							getTypeIdentifier,
							getTypeExportNameIdentifier
						)
					])
				),
				packageName
			)/*
			: ts.factory.createVariableStatement(
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
									packageName
								]
							),
							getTypeExportNameIdentifier
						)
					)
				]
			)*/;

		return {
			statement,
			getTypeIdentifier
		};
	}

	createImport(importInformation: ImportInformation): ts.Statement
	{
		const identifier = typeof importInformation.identifier === "string"
			? ts.factory.createIdentifier(importInformation.identifier)
			: importInformation.identifier;

		// NOTE: We do not have to solve require vs import. We can just create import() 
		// and TypeScript itself will handle translation of import into require by the configured target.
		
		// if (TransformerContext.instance.config.esmModuleKind)
		// {
			return this.createEsmImport(importInformation, identifier);
		// }
		//
		// return this.createRequireImport(importInformation, identifier);
	}
	
	// private createRequireImport(importInformation: Omit<ImportInformation, "identifier">, identifier: ts.Identifier): ts.Statement
	// {
	// 	let bindingName: ts.BindingName;
	// 	let requireExpression: ts.Expression = ts.factory.createCallExpression(
	// 		ts.factory.createIdentifier("require"),
	// 		undefined,
	// 		[ts.factory.createStringLiteral("tst-reflect")]
	// 	);
	//	
	// 	if (importInformation?.isDefault === true)
	// 	{
	// 		bindingName = identifier;
	// 		requireExpression = ts.factory.createPropertyAccessExpression(requireExpression, "default");
	// 	}
	// 	else if (importInformation?.namespaceImport === true)
	// 	{
	// 		bindingName = identifier;
	// 	}
	// 	else
	// 	{
	// 		bindingName = ts.factory.createObjectBindingPattern([
	// 			ts.factory.createBindingElement(undefined, undefined, identifier)
	// 		]);
	// 	}
	//	
	// 	return ts.factory.createVariableStatement(
	// 		undefined,
	// 		ts.factory.createVariableDeclarationList(
	// 			[
	// 				ts.factory.createVariableDeclaration(
	// 					bindingName,
	// 					undefined,
	// 					undefined,
	// 					requireExpression
	// 				)
	// 			],
	// 			ts.NodeFlags.Const
	// 		)
	// 	);
	// }

	private createEsmImport(importInformation: Omit<ImportInformation, "identifier">, identifier: ts.Identifier): ts.Statement
	{
		let importClause: ts.ImportClause;

		if (importInformation?.isDefault === true)
		{
			importClause = ts.factory.createImportClause(
				importInformation?.isTypeOnlyImport === true,
				identifier,
				undefined
			);
		}
		else if (importInformation?.namespaceImport === true)
		{
			importClause = ts.factory.createImportClause(
				importInformation?.isTypeOnlyImport === true,
				undefined,
				ts.factory.createNamespaceImport(identifier)
			);
		}
		else
		{
			importClause = ts.factory.createImportClause(
				importInformation?.isTypeOnlyImport === true,
				undefined,
				ts.factory.createNamedImports([
					ts.factory.createImportSpecifier(
						importInformation?.isTypeOnlyImport === true,
						undefined,
						identifier
					)
				])
			);
		}

		return ts.factory.createImportDeclaration(
			undefined,
			undefined,
			importClause,
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
		const props: ts.ObjectLiteralElementLike[] = [];

		for (let key of Object.keys(data))
		{
			const value = data[key];

			let valueNode: ts.Expression | undefined = undefined;

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
