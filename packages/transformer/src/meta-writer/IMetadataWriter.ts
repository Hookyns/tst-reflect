import { Context } from "../contexts/Context";

export interface IMetadataWriter
{
	// get factory(): IMetadataNodeGenerator;
	//
	// is(type: MetadataType): boolean;
	//
	// usesStubFile(): [boolean, string | undefined];
	//
	// /**
	//  * Get the stub file from "src/meta-writer/stubs" directory and turn it into ts.SourceFile
	//  *
	//  * @param {string} stubFileName
	//  * @returns {ts.SourceFile}
	//  */
	// getStubFile(stubFileName: string): ts.SourceFile;

	/**
	 * When we initialize the writer, we need to write some "base" meta to prepare it for
	 * adding all of our source file meta.
	 */
	createBaseMeta(): void;

	/**
	 * Return relative path to given file.
	 * Root of relative path is based on implementation (inline vs typeLib).
	 * TypeLib implementation returns path relative to metadata lib file.
	 * Inline is relative to current file.
	 * @param context
	 * @param filePath
	 */
	getRequireRelativePath(context: Context, filePath: string): string;

	// /**
	//  * Write our getType descriptions to the meta file
	//  *
	//  * @param {Array<[typeId: number, properties: ts.ObjectLiteralExpression]>} typesProperties
	//  * @param {Set<ts.PropertyAccessExpression>} typesCtors
	//  * @param {ts.TransformationContext} transformationContext
	//  */
	// writeMetaProperties(
	// 	typesProperties: Array<[typeId: number, properties: ts.ObjectLiteralExpression]>,
	// 	typesCtors: Set<ts.PropertyAccessExpression>,
	// 	transformationContext: ts.TransformationContext
	// ): void;
	//
	// /**
	//  * Add our meta lib as an import to the provided source file
	//  *
	//  * @param {ts.SourceFile} sourceFile
	//  * @returns {ts.SourceFile}
	//  */
	// addLibImportToSourceFile(sourceFile: ts.SourceFile): ts.SourceFile;
}