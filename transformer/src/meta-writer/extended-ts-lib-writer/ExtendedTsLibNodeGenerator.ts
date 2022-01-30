import { createValueExpression }       from "../../createValueExpression";
import { TypePropertiesSource }        from "../../declarations";
import { MetaWriterNodeGeneratorImpl } from "../MetaWriterNodeGeneratorImpl";
import * as ts                         from 'typescript';
import { factory }                     from 'typescript';


export class ExtendedTsLibNodeGenerator implements MetaWriterNodeGeneratorImpl
{
	sourceFileMetaLibStatements(metaLibImportPath?: string): ts.Statement[]
	{
		if (!metaLibImportPath)
		{
			return [];
		}

		return [
			factory.createVariableStatement(
				undefined,
				factory.createVariableDeclarationList(
					[factory.createVariableDeclaration(
						factory.createIdentifier("___tst_reflection_meta"),
						undefined,
						undefined,
						factory.createCallExpression(
							factory.createIdentifier("require"),
							undefined,
							[factory.createStringLiteral(metaLibImportPath)]
						)
					)],
					ts.NodeFlags.Const
				)
			),
			factory.createVariableStatement(
				undefined,
				factory.createVariableDeclarationList(
					[factory.createVariableDeclaration(
						factory.createIdentifier("_tst_reflect_get"),
						undefined,
						undefined,
						factory.createPropertyAccessExpression(
							factory.createIdentifier("___tst_reflection_meta"),
							factory.createIdentifier("_tst_reflect_get")
						)
					)],
					ts.NodeFlags.Const
				)
			),
			factory.createVariableStatement(
				undefined,
				factory.createVariableDeclarationList(
					[factory.createVariableDeclaration(
						factory.createIdentifier("_tst_reflect_wrap"),
						undefined,
						undefined,
						factory.createPropertyAccessExpression(
							factory.createIdentifier("___tst_reflection_meta"),
							factory.createIdentifier("_tst_reflect_wrap")
						)
					)],
					ts.NodeFlags.Const
				)
			)
		];
	}

	addDescriptionToStore(typeId: number, description: TypePropertiesSource): ts.CallExpression
	{
		return factory.createCallExpression(
			factory.createIdentifier("_tst_reflect_set"),
			undefined,
			[
				factory.createNumericLiteral(typeId),
				createValueExpression(description) as ts.ObjectLiteralExpression
			]
		);
	}

	createDescriptionWithoutAddingToStore(description: TypePropertiesSource): ts.CallExpression
	{
		return factory.createCallExpression(
			factory.createIdentifier("_tst_reflect_wrap"),
			undefined,
			[createValueExpression(description) as ts.ObjectLiteralExpression]
		);
	}

	getTypeFromStore(typeId: number): ts.CallExpression
	{
		return factory.createCallExpression(
			factory.createIdentifier("_tst_reflect_get"),
			undefined,
			[factory.createNumericLiteral(typeId)]
		);
	}

	getTypeFromStoreLazily(typeId: number): ts.CallExpression
	{
		return factory.createCallExpression(
			factory.createIdentifier("_tst_reflect_lazy"),
			undefined,
			[factory.createNumericLiteral(typeId)]
		);
	}

	updateTypesForMetaLib?(
		typesProperties: Array<[typeId: number, properties: ts.ObjectLiteralExpression]>,
		typesCtors: Set<ts.PropertyAccessExpression>,
		transformationContext: ts.TransformationContext,
		forType: "libFile" | "sourceFile"
	): ts.Statement[];

}
