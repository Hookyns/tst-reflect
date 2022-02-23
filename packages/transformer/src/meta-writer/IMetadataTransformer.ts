import * as ts from "typescript";

export interface IMetadataTransformer
{
	transformGetTypeIdentifiers(transformationContext: ts.TransformationContext): ts.Visitor;

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
		sourceFile: ts.SourceFile | undefined,
		typesProperties: Array<[typeId: number, properties: ts.ObjectLiteralExpression]>,
		typesCtors: Set<ts.PropertyAccessExpression>,
		transformationContext: ts.TransformationContext
	): Array<ts.Statement>;

	/**
	 * Generally just cleans up the code, but pointless abstraction
	 *
	 * We update the provided source file with the new statements
	 *
	 * @param {ts.SourceFile} sourceFile
	 * @param {Array<ts.Statement>} statements
	 * @returns {ts.SourceFile}
	 */
	transformMetaLibSourceFileStatements(sourceFile: ts.SourceFile, statements: Array<ts.Statement>): ts.SourceFile;
}
