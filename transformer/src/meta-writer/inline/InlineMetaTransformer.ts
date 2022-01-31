import { GET_TYPE_FNC_NAME }      from "tst-reflect";
import { MetaLibTransformerImpl } from "../impl";
import * as ts                    from 'typescript';

export class InlineMetaTransformer implements MetaLibTransformerImpl
{
	constructor(private getTypeIdentifier: ts.Identifier)
	{

	}

	/**
	 * Generally just cleans up the code, but pointless abstraction
	 *
	 * We update the provided source file with the new statements
	 *
	 * @param {ts.SourceFile} sourceFile
	 * @param {Array<ts.Statement>} statements
	 * @returns {ts.SourceFile}
	 */
	transformMetaLibSourceFileStatements(sourceFile: ts.SourceFile, statements: Array<ts.Statement>): ts.SourceFile
	{
		return ts.factory.updateSourceFile(
			sourceFile,
			statements,
			sourceFile.isDeclarationFile,
			sourceFile.referencedFiles,
			sourceFile.typeReferenceDirectives,
			sourceFile.hasNoDefaultLib,
			sourceFile.libReferenceDirectives,
		);
	}

	/**
	 * When we're adding descriptions to our meta file, we'll need to change the calls
	 * from their original getType() to the specified meta file type
	 *
	 * @param {ts.SourceFile} sourceFile
	 * @param {Array<[typeId: number, properties: ts.ObjectLiteralExpression]>} typesProperties
	 * @param {Set<ts.PropertyAccessExpression>} typesCtors
	 * @param {ts.TransformationContext} transformationContext
	 * @returns {Array<ts.Statement>}
	 */
	transformMetaProperties(
		sourceFile: ts.SourceFile,
		typesProperties: Array<[typeId: number, properties: ts.ObjectLiteralExpression]>,
		typesCtors: Set<ts.PropertyAccessExpression>,
		transformationContext: ts.TransformationContext
	): Array<ts.Statement>
	{
		const propertiesStatements: Array<ts.Statement> = [];

		for (let [typeId, properties] of typesProperties)
		{
			// Replace all getType identifier by metadata getType identifier
			const updatedProperties = ts.visitEachChild(
				properties,
				this.transformGetTypeIdentifiers(transformationContext),
				transformationContext
			) as ts.ObjectLiteralExpression;

			propertiesStatements.push(ts.factory.createExpressionStatement(
				ts.factory.createCallExpression(this.getTypeIdentifier, [], [
					ts.factory.createNumericLiteral(typeId), updatedProperties
				])
			));
		}


		return propertiesStatements;
	}

	transformGetTypeIdentifiers(transformationContext: ts.TransformationContext): ts.Visitor
	{
		return node => {
			if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.escapedText == GET_TYPE_FNC_NAME)
			{
				return ts.factory.updateCallExpression(
					node,
					this.getTypeIdentifier,
					node.typeArguments,
					ts.visitNodes(
						node.arguments,
						this.transformGetTypeIdentifiers(transformationContext)
					)
				);
			}

			return ts.visitEachChild(node, this.transformGetTypeIdentifiers(transformationContext), transformationContext);
		};
	}

}
