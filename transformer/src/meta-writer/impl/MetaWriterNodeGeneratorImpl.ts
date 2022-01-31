import * as ts                  from 'typescript';
import { TypePropertiesSource } from "../../declarations";

export interface MetaWriterNodeGeneratorImpl
{
	/**
	 * This should be statements that need to be included in the source file using getType();
	 */
	sourceFileMetaLibStatements(metaLibImportPath?: string): ts.Statement[];

	getTypeFromStoreLazily(typeId: number): ts.CallExpression;

	getTypeFromStore(typeId: number): ts.CallExpression;

	createDescriptionWithoutAddingToStore(description: TypePropertiesSource): ts.CallExpression;

	addDescriptionToStore(typeId: number, description: TypePropertiesSource | ts.ObjectLiteralExpression): ts.CallExpression;

	updateSourceFileGetTypeCall(call: ts.CallExpression, sourceFile?: ts.SourceFile): ts.CallExpression;
}
