import { GET_TYPE_LAZY_FNC_NAME }      from "tst-reflect";
import { createValueExpression }       from "../../createValueExpression";
import { TypePropertiesSource }        from "../../declarations";
import { hasRuntimePackageImport }     from "../../helpers";
import { MetaWriterNodeGeneratorImpl } from "../impl";
import * as ts                         from 'typescript';
import { factory }                     from 'typescript';


export class InlineNodeGenerator implements MetaWriterNodeGeneratorImpl
{

	/**
	 * Generated import statements which will be added to each source file
	 *
	 * @param {string} metaLibImportPath
	 * @returns {ts.Statement[]}
	 */
	sourceFileMetaLibStatements(metaLibImportPath?: string): ts.Statement[]
	{
		return [
			factory.createVariableStatement(
				undefined,
				factory.createVariableDeclarationList(
					[factory.createVariableDeclaration(
						factory.createIdentifier("___tst_reflect"),
						undefined,
						undefined,
						factory.createCallExpression(
							factory.createIdentifier("require"),
							undefined,
							[factory.createStringLiteral("tst-reflect")]
						)
					)],
					ts.NodeFlags.Const
				)
			),
		];
	}

	/**
	 * Generated method call which adds the generated source description of a node to the store
	 *
	 * @param {number} typeId
	 * @param {TypePropertiesSource} description
	 * @returns {ts.CallExpression}
	 */
	addDescriptionToStore(typeId: number, description: TypePropertiesSource | ts.ObjectLiteralExpression): ts.CallExpression
	{
		const properties: ts.ObjectLiteralExpression = ts.isObjectLiteralExpression(<ts.ObjectLiteralExpression>description)
			? <ts.ObjectLiteralExpression>description
			: createValueExpression(description) as ts.ObjectLiteralExpression;

		return factory.createCallExpression(
			factory.createPropertyAccessExpression(
				factory.createPropertyAccessExpression(
					factory.createPropertyAccessExpression(
						factory.createIdentifier("___tst_reflect"),
						factory.createIdentifier("Type")
					),
					factory.createIdentifier("store")
				),
				factory.createIdentifier("set")
			),
			undefined,
			[factory.createNumericLiteral(typeId), properties]
		);
	}

	/**
	 * Generated method call which creates a Type from a source description inline
	 *
	 * @param {TypePropertiesSource} description
	 * @returns {ts.CallExpression}
	 */
	createDescriptionWithoutAddingToStore(description: TypePropertiesSource): ts.CallExpression
	{
		return factory.createCallExpression(
			factory.createPropertyAccessExpression(
				factory.createPropertyAccessExpression(
					factory.createPropertyAccessExpression(
						factory.createIdentifier("___tst_reflect"),
						factory.createIdentifier("Type")
					),
					factory.createIdentifier("store")
				),
				factory.createIdentifier("wrap")
			),
			undefined,
			[createValueExpression(description)]
		);
	}

	/**
	 * Generated method call to get a type from the store by its id
	 *
	 * @param {number} typeId
	 * @returns {ts.CallExpression}
	 */
	getTypeFromStore(typeId: number): ts.CallExpression
	{
		return factory.createCallExpression(
			factory.createPropertyAccessExpression(
				factory.createPropertyAccessExpression(
					factory.createPropertyAccessExpression(
						factory.createIdentifier("___tst_reflect"),
						factory.createIdentifier("Type")
					),
					factory.createIdentifier("store")
				),
				factory.createIdentifier("get")
			),
			undefined,
			[factory.createNumericLiteral(typeId)]
		);
	}

	/**
	 * Generated method call to get a type from the store by its id, but is wrapped in a function.
	 *
	 * @param {number} typeId
	 * @returns {ts.CallExpression}
	 */
	getTypeFromStoreLazily(typeId: number): ts.CallExpression
	{
		return factory.createCallExpression(
			factory.createPropertyAccessExpression(
				factory.createPropertyAccessExpression(
					factory.createPropertyAccessExpression(
						factory.createIdentifier("___tst_reflect"),
						factory.createIdentifier("Type")
					),
					factory.createIdentifier("store")
				),
				factory.createIdentifier("lazy")
			),
			undefined,
			[factory.createNumericLiteral(typeId)]
		);
	}

	/**
	 * When we're at the top-level our getType call processing, we need to replace
	 * the method call with our own version which references the meta lib
	 *
	 * @param {ts.CallExpression} call
	 * @returns {ts.CallExpression}
	 */
	updateSourceFileGetTypeCall(call: ts.CallExpression, sourceFile?: ts.SourceFile): ts.CallExpression
	{
		return ts.factory.updateCallExpression(
			call,
			factory.createPropertyAccessExpression(
				factory.createPropertyAccessExpression(
					factory.createPropertyAccessExpression(
						// this.inFileGetTypeIdentifier,
						factory.createIdentifier("___tst_reflect"),
						factory.createIdentifier("Type")
					),
					factory.createIdentifier("store")
				),
				factory.createIdentifier("get")
			),
			call.typeArguments,
			call.arguments
		);
	}

}
