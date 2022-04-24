import path                      from "path";
import * as ts                   from "typescript";
import {
	MetadataType,
	MetadataTypeValues
}                                from "../../config-options";
import { Context }               from "../../contexts/Context";
import { TransformerContext }    from "../../contexts/TransformerContext";
import { ImportInfo }            from "../../declarations";
import { PATH_SEPARATOR_REGEX, } from "../../helpers";
import { log }                   from "../../log";
import { IMetadataWriter }       from "./IMetadataWriter";

export abstract class MetadataWriterBase implements IMetadataWriter
{
	/**
	 * Transformer context
	 * @protected
	 */
	protected context: TransformerContext;

	/**
	 * The current type of meta writer
	 * @protected
	 */
	protected type: MetadataType = MetadataTypeValues.inline;

	// /**
	//  * Factory functions for generating nodes, based on the type of meta writer
	//  * @protected
	//  */
	// protected metadataNodeGenerator: IMetadataNodeGenerator;
	//
	// /**
	//  * Transformer functions for updating data during our life-cycle
	//  * @protected
	//  */
	// protected metadataTransformer: IMetadataTransformer;

	/**
	 * The absolute file path to the meta file in the source
	 * @protected
	 */
	protected metadataFilePath: string;

	// /**
	//  * The ts compiler source file version of this meta file
	//  * @protected
	//  */
	// protected metaSourceFile: ts.SourceFile | undefined;

	// /**
	//  * When we add meta for x source file, we'll store its "ts.SourceFile.fileName" here.
	//  * @private
	//  */
	// private _addedMetaForSourceFile: string[] = [];
	//
	// /**
	//  * When we've added the import for the generated meta file for x
	//  * source file, we'll store its "ts.SourceFile.fileName" here.
	//  * @private
	//  */
	// private _addedLibImport: string[] = [];
	//
	// /**
	//  * The "getType()" call identifier that will be used in source files
	//  * @protected
	//  */
	// protected inFileGetTypeIdentifier: ts.Identifier;
	//
	// /**
	//  * The "getType()" call identifier that will be used in the meta lib
	//  * @protected
	//  */
	// protected metaFileGetTypeIdentifier: ts.Identifier;

	// /**
	//  * The typescript printer used to get a text version of a source file
	//  * @protected
	//  */
	// protected tsPrinter: ts.Printer;

	/**
	 * Protected ctor
	 * @param metadataFilePath
	 * @param context
	 * @protected
	 */
	protected constructor(
		metadataFilePath: string,
		context: TransformerContext
	)
	{
		this.context = context;
		this.metadataFilePath = metadataFilePath;
	}

	/**
	 * @inheritDoc
	 */
	abstract getRequireRelativePath(context: Context, filePath: string): string;

	// /**
	//  * Get the stub file from "src/meta-writer/stubs" directory and turn it into ts.SourceFile
	//  *
	//  * @param {string} stubFileName
	//  * @returns {ts.SourceFile}
	//  */
	// getStubFile(stubFileName: string): ts.SourceFile
	// {
	// 	if (!this.context.program)
	// 	{
	// 		throw new Error("[Extended Meta Lib] : Program is not attached to context?");
	// 	}
	//
	// 	const sourcePath = path.resolve(__dirname, "..", "..", "meta-templates", stubFileName);
	// 	const stubSrcContents = fs.readFileSync(sourcePath, "utf-8");
	//
	// 	return ts.createSourceFile(
	// 		this.metadataFilePath, stubSrcContents, ts.ScriptTarget.ES2015
	// 	);
	// }

	/**
	 * When we initialize the writer, we need to write some "base" meta to prepare it for
	 * adding all of our source file meta.
	 */
	createBaseMeta()
	{
		// if (!this.isUsingLibFile())
		// {
		// 	return;
		// }
		//
		// let statements: ts.Statement[] = [];
		//
		// if (this.usesStubFile() && this.metaSourceFile)
		// {
		// 	statements = [...this.metaSourceFile.statements];
		// }
		// else
		// {
		// 	const { statement, getTypeIdentifier } = nodeGenerator.createGetTypeImport();
		// 	this.inFileGetTypeIdentifier = getTypeIdentifier;
		// 	// SourceFile with import {getType} from "tst-reflect"
		// 	statements = [statement];
		// }
		//
		// this.writeSourceFile(this.createMetaSourceFile(statements));
		//
		// this.logMessage(`Wrote lib file to ${this.metadataFilePath}`);
	}

	/**
	 * Return relative path from source file to the type lib file.
	 * @param {ts.SourceFile} sourceFile
	 * @returns {string}
	 */
	private getRelativePathToTypeLib(sourceFile: ts.SourceFile): string
	{
		return this.getRelativePath(sourceFile.fileName, this.metadataFilePath);
	}

	/**
	 * Returns relative path from source file to target file.
	 * @param sourceFilePath
	 * @param targetFilePath
	 * @protected
	 */
	protected getRelativePath(sourceFilePath: string, targetFilePath: string)
	{
		return this.replaceExtension(
			"./" + path.relative(path.dirname(sourceFilePath), targetFilePath),
			""
		);
	}

	/**
	 * Return function resolving type's Ctor in runtime.
	 */
	createCtorPromise(
		constructorDescription: ImportInfo | undefined,
		context: Context
	): [resolver: ts.FunctionExpression | undefined, accessToExportedMember: ts.PropertyAccessExpression | undefined] // TODO: Move this to some metadata writer
	{
		if (!constructorDescription)
		{
			return [undefined, undefined];
		}

		let relative = context.metadata.writer.getRequireRelativePath(context, constructorDescription.path);

		if (context.config.debugMode)
		{
			log.info(`Relative import for source file(${context.currentSourceFile.fileName}) is: ${relative}`);
		}

		if (context.config.esmModule)
		{
			// import("...path...").then(m => m.ExportedMember)
			const importExpression = ts.factory.createCallExpression(
				ts.factory.createPropertyAccessExpression(
					ts.factory.createCallExpression(
						ts.factory.createIdentifier("import"),
						undefined,
						[
							ts.factory.createStringLiteral(relative)
						]
					),
					"then"
				),
				undefined,
				[
					ts.factory.createArrowFunction(
						undefined,
						undefined,
						[
							ts.factory.createParameterDeclaration(
								undefined,
								undefined,
								undefined,
								"m"
							)
						],
						undefined,
						ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
						ts.factory.createPropertyAccessExpression(
							ts.factory.createIdentifier("m"),
							ts.factory.createIdentifier(constructorDescription.exportName)
						)
					)
				]
			);

			return [
				// function() { return $importExpression }
				ts.factory.createFunctionExpression(
					undefined,
					undefined,
					undefined,
					undefined,
					[],
					undefined,
					ts.factory.createBlock([ts.factory.createReturnStatement(importExpression)], true)
				),
				undefined
			];
		}

		// require("...path...")
		const requireCall = ts.factory.createPropertyAccessExpression(
			ts.factory.createCallExpression(
				ts.factory.createIdentifier("require"),
				undefined,
				[ts.factory.createStringLiteral(relative)]
			),
			ts.factory.createIdentifier(constructorDescription.exportName)
		);

		// Promise.resolve($require)
		const promise = ts.factory.createCallExpression(
			ts.factory.createPropertyAccessExpression(
				ts.factory.createIdentifier("Promise"),
				ts.factory.createIdentifier("resolve")
			),
			undefined,
			[
				requireCall
			]
		);

		// function() { return $Promise }
		const functionCall = ts.factory.createFunctionExpression(
			undefined,
			undefined,
			undefined,
			undefined,
			[],
			undefined,
			ts.factory.createBlock([ts.factory.createReturnStatement(promise)], true)
		);

		return [functionCall, requireCall];
	}

	// protected getOutPathForSourceFile(sourceFileName: string, context: Context): string
	// {
	// 	if (isTsNode())
	// 	{
	// 		return sourceFileName;
	// 	}
	//
	// 	if (context.config.parsedCommandLine)
	// 	{
	// 		// getOutputPathWithoutChangingExt(
	// 		// 	sourceFileName,
	// 		// 	context.config.parsedCommandLine,
	// 		// 	true,
	// 		// 	context
	// 		// )
	// 		return ts.getOutputFileNames(context.config.parsedCommandLine, sourceFileName, false).filter(fn => fn.slice(-3) == ".js" || fn.slice(-4) == ".jsx")[0];
	// 	}
	//
	// 	// Get the actual file location, regardless of dist/source dir
	// 	// This should leave us with:
	// 	// /ctor-reflection/SomeServiceClass.ts
	// 	let outPath = sourceFileName.replace(context.config.rootDir, "");
	//
	// 	// If we have a slash at the start, it has to go
	// 	// Now we have:
	// 	// ctor-reflection/SomeServiceClass.ts
	// 	if (outPath.startsWith("/"))
	// 	{
	// 		outPath = outPath.slice(1);
	// 	}
	//
	// 	// Now we can take the build path, from the tsconfig file and combine it
	// 	// This should give us:
	// 	// /Users/sam/Code/Packages/ts-reflection/dev/testing/dist/method-reflection/index.ts
	// 	outPath = path.join(context.config.outDir, outPath);
	//
	// 	return replaceExtension(outPath, ".js");
	// }

	protected replaceExtension(fileName: string, replaceWith: string): string
	{
		const extName = path.extname(fileName);
		// If we're running ts-node, the outDir is set to ".ts-node" and it can't be over-ridden
		// If we just do .replace(extName, '.js'), it won't replace the actual file extension
		// Now we just replace the extension:
		if (fileName.endsWith(extName))
		{
			fileName = fileName.slice(0, fileName.length - extName.length) + replaceWith;
		}

		return fileName.replace(PATH_SEPARATOR_REGEX, "/");
	}

// function getOutputPathWithoutChangingExt(inputFileName: string, configFile: ts.ParsedCommandLine, ignoreCase: boolean, getCommonSourceDirectory) {
// 	return configFile.options.outDir ?
// 		(ts as any).resolvePath(configFile.options.outDir, (ts as any).getRelativePathFromDirectory(getCommonSourceDirectory ? getCommonSourceDirectory() : getCommonSourceDirectoryOfConfig(configFile, ignoreCase), inputFileName, ignoreCase)) :
// 		inputFileName;
// }

	// writeTranspiledMetaSourceFile()
	// {
	// 	if (!this.metaSourceFile)
	// 	{
	// 		return;
	// 	}
	//
	// 	const source = this.writeSourceFile(this.metaSourceFile);
	//
	// 	this.logMessage(`Wrote updated lib file to ${this.metadataFilePath}`);
	//
	// 	if (!source)
	// 	{
	// 		return;
	// 	}
	//
	// 	const parsedCommandLine = this.context.config.parsedCommandLine;
	// 	let outFileName: string | undefined = undefined;
	//
	// 	if (parsedCommandLine)
	// 	{
	// 		if (parsedCommandLine.fileNames.indexOf(this.metaSourceFile.fileName) == -1)
	// 		{
	// 			parsedCommandLine.fileNames.push(this.metaSourceFile.fileName);
	// 		}
	//
	// 		outFileName = ts.getOutputFileNames(parsedCommandLine, this.metaSourceFile.fileName, false).filter(fn => fn.slice(-3) == ".js" || fn.slice(-4) == ".jsx")[0];
	// 	}
	//
	// 	if (!outFileName)
	// 	{
	// 		const pathParsed = path.parse(this.metaSourceFile.fileName);
	//
	// 		outFileName = this.metaSourceFile.fileName
	// 			.replace("src/", "dist/")
	// 			.replace(pathParsed.base, pathParsed.name) + ".js";
	// 	}
	//
	// 	const res = ts.transpileModule(source, {
	// 		fileName: outFileName,
	// 		compilerOptions: this.context.program?.getCompilerOptions()
	// 	});
	//
	// 	if (res)
	// 	{
	// 		fs.mkdirSync(path.dirname(outFileName), { recursive: true });
	// 		fs.writeFileSync(outFileName, res.outputText, "utf8");
	// 	}
	// }
	//
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
	// )
	// {
	// 	if (!this.metaSourceFile)
	// 	{
	// 		return;
	// 	}
	//
	// 	const properties = this.metadataTransformer.transformMetaProperties(
	// 		this.metaSourceFile, typesProperties, typesCtors, transformationContext
	// 	);
	//
	// 	this.metaSourceFile = this.metadataTransformer.transformMetaLibSourceFileStatements(
	// 		this.metaSourceFile, properties
	// 	);
	//
	// 	this.writeTranspiledMetaSourceFile();
	// }
	//
	// /**
	//  * Add our meta lib as an import to the provided source file
	//  *
	//  * @param {ts.SourceFile} sourceFile
	//  * @returns {ts.SourceFile}
	//  */
	// addLibImportToSourceFile(sourceFile: ts.SourceFile): ts.SourceFile
	// {
	// 	if (!this.metaSourceFile)
	// 	{
	// 		return sourceFile;
	// 	}
	//
	// 	if (sourceFile.fileName.includes(this.metaSourceFile.fileName))
	// 	{
	// 		return sourceFile;
	// 	}
	//
	// 	if (this.hasAddedMetaLibImport(sourceFile.fileName))
	// 	{
	// 		return sourceFile;
	// 	}
	//
	// 	const relative = this.getRelativePathToTypeLib(sourceFile);
	//
	// 	this.logMessage(`Added lib import to source file:${sourceFile.fileName}`);
	//
	// 	this.addedMetaLibImport(sourceFile.fileName);
	//
	// 	return ts.factory.updateSourceFile(sourceFile, [
	// 		...this.metadataNodeGenerator.sourceFileMetaLibStatements(relative),
	// 		...sourceFile.statements
	// 	]);
	// }
	//
	// is(type: MetadataType): boolean
	// {
	// 	return this.type === type;
	// }
	//
	// /**
	//  * Simplified version of {@see usesStubFile}
	//  *
	//  * @returns {boolean}
	//  * @private
	//  */
	// private isUsingStubFile(): boolean
	// {
	// 	return this.usesStubFile()[0];
	// }
	//
	// /**
	//  * This is true if we're going to be writing meta to a "meta file".
	//  *
	//  * @returns {boolean}
	//  * @private
	//  */
	// private isUsingLibFile(): boolean
	// {
	// 	return this.metaSourceFile !== undefined;
	// }
	//
	// /**
	//  * If this meta writer uses a stub file, we'll generate a {ts.SourceFile} from this.
	//  *
	//  * @returns {ts.SourceFile}
	//  * @protected
	//  */
	// protected createLibFile(): ts.SourceFile | undefined
	// {
	// 	const [usesStub, stubFileName] = this.usesStubFile();
	//
	// 	if (usesStub && stubFileName)
	// 	{
	// 		return this.getStubFile(stubFileName);
	// 	}
	//
	// 	return undefined;
	// }
	//
	// /**
	//  * Create a new ts.SourceFile file from our provided statements
	//  *
	//  * @param {ts.Statement[]} statements
	//  * @protected
	//  */
	// protected createMetaSourceFile(statements: ts.Statement[]): ts.SourceFile
	// {
	// 	return ts.factory.createSourceFile(
	// 		statements,
	// 		ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
	// 		ts.NodeFlags.None
	// 	);
	// }
	//
	// /**
	//  * Create a new ts source file from our provided statements and write it to the filesystem
	//  *
	//  * @protected
	//  */
	// protected writeSourceFile(sourceFile?: ts.SourceFile): string | undefined
	// {
	// 	sourceFile = sourceFile ?? this.metaSourceFile;
	//
	// 	if (!sourceFile)
	// 	{
	// 		return;
	// 	}
	//
	// 	const source = this.tsPrinter.printFile(sourceFile);
	//
	// 	fs.writeFileSync(this.metadataFilePath, source, { encoding: "utf8", flag: "w" });
	//
	// 	return source;
	// }

	// /**
	//  * Log trace message
	//  * @param message
	//  * @param args
	//  * @protected
	//  */
	// protected logMessage(message: string, ...args: any[])
	// {
	// 	if (this.context.config.debugMode)
	// 	{
	// 		log.log(LogLevel.Trace, color.magenta, `[${this.type}] : ${message}`, ...(args || []));
	// 	}
	// }
	//
	// /**
	//  * Has the source file had meta handled for it?
	//  *
	//  * @param {string} filePath
	//  * @returns {boolean}
	//  */
	// private hasWrittenMetaForFile(filePath: string): boolean
	// {
	// 	return this._addedMetaForSourceFile.includes(filePath);
	// }
	//
	// /**
	//  * Save that we've handled meta for the source file
	//  *
	//  * @param {string} filePath
	//  */
	// private metaWrittenForFile(filePath: string): void
	// {
	// 	this._addedMetaForSourceFile.push(filePath);
	// }
	//
	// /**
	//  * Check if we've added the import for the meta lib to x source file
	//  *
	//  * @param {string} fileName
	//  * @returns {boolean}
	//  */
	// protected hasAddedMetaLibImport(fileName: string): boolean
	// {
	// 	return this._addedLibImport.includes(fileName);
	// }
	//
	// /**
	//  * Save that we've added the import for the meta lib in x source file
	//  * @param {string} fileName
	//  */
	// protected addedMetaLibImport(fileName: string): void
	// {
	// 	this._addedLibImport.push(fileName);
	// }
	//
	// get factory(): IMetadataNodeGenerator
	// {
	// 	return this.metadataNodeGenerator;
	// }
}