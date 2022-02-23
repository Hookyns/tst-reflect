import * as fs                        from "fs";
import * as path                      from "path";
import * as ts                        from "typescript";
import {
	MetadataType,
	MetadataTypeValues
}                                     from "../config-options";
import { Context }                    from "../contexts/Context";
import TransformerContext             from "../contexts/TransformerContext";
import { getRequireRelativePath }     from "../helpers";
import {
	color,
	log,
	LogLevel
}                                     from "../log";
import { nodeGenerator }              from "../NodeGenerator";
import { MetadataTransformerFactory } from "./factories/MetadataTransformerFactory";
import { IMetadataWriter }            from "./IMetadataWriter";
import { IMetadataNodeGenerator }     from "./IMetadataNodeGenerator";
import { IMetadataTransformer }       from "./IMetadataTransformer";

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

	/**
	 * Factory functions for generating nodes, based on the type of meta writer
	 * @protected
	 */
	protected metadataNodeGenerator: IMetadataNodeGenerator;

	/**
	 * Transformer functions for updating data during our life-cycle
	 * @protected
	 */
	protected metadataTransformer: IMetadataTransformer;

	/**
	 * The absolute file path to the meta file in the source
	 * @protected
	 */
	protected metadataFilePath: string;

	/**
	 * The ts compiler source file version of this meta file
	 * @protected
	 */
	protected metaSourceFile: ts.SourceFile | undefined;

	/**
	 * When we add meta for x source file, we'll store its "ts.SourceFile.fileName" here.
	 * @private
	 */
	private _addedMetaForSourceFile: string[] = [];

	/**
	 * When we've added the import for the generated meta file for x
	 * source file, we'll store its "ts.SourceFile.fileName" here.
	 * @private
	 */
	private _addedLibImport: string[] = [];

	/**
	 * The "getType()" call identifier that will be used in source files
	 * @protected
	 */
	protected inFileGetTypeIdentifier: ts.Identifier;

	/**
	 * The "getType()" call identifier that will be used in the meta lib
	 * @protected
	 */
	protected metaFileGetTypeIdentifier: ts.Identifier;

	/**
	 * The typescript printer used to get a text version of a source file
	 * @protected
	 */
	protected tsPrinter: ts.Printer;

	/**
	 * Protected ctor
	 * @param metadataFilePath
	 * @param context
	 * @param inFileGetTypeIdentifier
	 * @param metaFileGetTypeIdentifier
	 * @param metadataNodeGenerator
	 * @param metadataTransformerFactory
	 * @protected
	 */
	protected constructor(
		metadataFilePath: string,
		context: TransformerContext,
		metadataNodeGenerator: IMetadataNodeGenerator,
		metadataTransformerFactory: MetadataTransformerFactory,
		inFileGetTypeIdentifier: ts.Identifier = ts.factory.createIdentifier("_tst_reflect_set"),
		metaFileGetTypeIdentifier: ts.Identifier = ts.factory.createIdentifier("_tst_reflect_set")
	)
	{
		this.context = context;
		this.metadataFilePath = metadataFilePath;
		this.inFileGetTypeIdentifier = inFileGetTypeIdentifier;
		this.metaFileGetTypeIdentifier = metaFileGetTypeIdentifier;
		this.metadataNodeGenerator = metadataNodeGenerator;
		this.metadataTransformer = metadataTransformerFactory.create(metaFileGetTypeIdentifier);

		this.tsPrinter = ts.createPrinter();
		this.metaSourceFile = this.createLibFile();
	}

	/**
	 * Does this meta writer use a stub file?
	 *
	 * For example,
	 * ts version uses a file with pre-made store etc.
	 * js version is generated on the fly
	 * inline doesn't use one
	 *
	 * If it uses a stub file, we return [yes, stub file name]
	 * If not, [no, undefined]
	 *
	 * @returns {[boolean, string|undefined]}
	 */
	abstract usesStubFile(): [boolean, string | undefined];

	/**
	 * @inheritDoc
	 */
	abstract getRequireRelativePath(context: Context, filePath: string): string;

	/**
	 * Get the stub file from "src/meta-writer/stubs" directory and turn it into ts.SourceFile
	 *
	 * @param {string} stubFileName
	 * @returns {ts.SourceFile}
	 */
	getStubFile(stubFileName: string): ts.SourceFile
	{
		if (!this.context.program)
		{
			throw new Error("[Extended Meta Lib] : Program is not attached to context?");
		}

		const sourcePath = path.resolve(__dirname, "..", "..", "meta-templates", stubFileName);
		const stubSrcContents = fs.readFileSync(sourcePath, "utf-8");

		return ts.createSourceFile(
			this.metadataFilePath, stubSrcContents, ts.ScriptTarget.ES2015
		);
	}

	/**
	 * When we initialize the writer, we need to write some "base" meta to prepare it for
	 * adding all of our source file meta.
	 */
	createBaseMeta()
	{
		if (!this.isUsingLibFile())
		{
			return;
		}

		let statements: ts.Statement[] = [];

		if (this.usesStubFile() && this.metaSourceFile)
		{
			statements = [...this.metaSourceFile.statements];
		}
		else
		{
			const { statement, getTypeIdentifier } = nodeGenerator.createGetTypeImport();
			this.inFileGetTypeIdentifier = getTypeIdentifier;
			// SourceFile with import {getType} from "tst-reflect"
			statements = [statement];
		}

		this.writeSourceFile(this.createMetaSourceFile(statements));

		this.logMessage(`Wrote lib file to ${this.metadataFilePath}`);
	}

	writeTranspiledMetaSourceFile()
	{
		if (!this.metaSourceFile)
		{
			return;
		}

		const source = this.writeSourceFile(this.metaSourceFile);

		this.logMessage(`Wrote updated lib file to ${this.metadataFilePath}`);

		if (!source)
		{
			return;
		}

		const parsedCommandLine = this.context.config.parsedCommandLine;
		let outFileName: string | undefined = undefined;

		if (parsedCommandLine)
		{
			if (parsedCommandLine.fileNames.indexOf(this.metaSourceFile.fileName) == -1)
			{
				parsedCommandLine.fileNames.push(this.metaSourceFile.fileName);
			}

			outFileName = ts.getOutputFileNames(parsedCommandLine, this.metaSourceFile.fileName, false).filter(fn => fn.slice(-3) == ".js" || fn.slice(-4) == ".jsx")[0];
		}

		if (!outFileName)
		{
			const pathParsed = path.parse(this.metaSourceFile.fileName);

			outFileName = this.metaSourceFile.fileName
				.replace("src/", "dist/")
				.replace(pathParsed.base, pathParsed.name) + ".js";
		}

		const res = ts.transpileModule(source, {
			fileName: outFileName,
			compilerOptions: this.context.program?.getCompilerOptions()
		});

		if (res)
		{
			fs.mkdirSync(path.dirname(outFileName), { recursive: true });
			fs.writeFileSync(outFileName, res.outputText, "utf8");
		}
	}

	/**
	 * Write our getType descriptions to the meta file
	 *
	 * @param {Array<[typeId: number, properties: ts.ObjectLiteralExpression]>} typesProperties
	 * @param {Set<ts.PropertyAccessExpression>} typesCtors
	 * @param {ts.TransformationContext} transformationContext
	 */
	writeMetaProperties(
		typesProperties: Array<[typeId: number, properties: ts.ObjectLiteralExpression]>,
		typesCtors: Set<ts.PropertyAccessExpression>,
		transformationContext: ts.TransformationContext
	)
	{
		if (!this.metaSourceFile)
		{
			return;
		}

		const properties = this.metadataTransformer.transformMetaProperties(
			this.metaSourceFile, typesProperties, typesCtors, transformationContext
		);

		this.metaSourceFile = this.metadataTransformer.transformMetaLibSourceFileStatements(
			this.metaSourceFile, properties
		);

		this.writeTranspiledMetaSourceFile();
	}

	/**
	 * Add our meta lib as an import to the provided source file
	 *
	 * @param {ts.SourceFile} sourceFile
	 * @returns {ts.SourceFile}
	 */
	addLibImportToSourceFile(sourceFile: ts.SourceFile): ts.SourceFile
	{
		if (!this.metaSourceFile)
		{
			return sourceFile;
		}

		if (sourceFile.fileName.includes(this.metaSourceFile.fileName))
		{
			return sourceFile;
		}

		if (this.hasAddedMetaLibImport(sourceFile.fileName))
		{
			return sourceFile;
		}

		const relative = this.getRelativeMetaLibPath(sourceFile);

		this.logMessage(`Added lib import to source file:${sourceFile.fileName}`);

		this.addedMetaLibImport(sourceFile.fileName);

		return ts.factory.updateSourceFile(sourceFile, [
			...this.metadataNodeGenerator.sourceFileMetaLibStatements(relative),
			...sourceFile.statements
		]);
	}

	is(type: MetadataType): boolean
	{
		return this.type === type;
	}

	/**
	 * Simplified version of {@see usesStubFile}
	 *
	 * @returns {boolean}
	 * @private
	 */
	private isUsingStubFile(): boolean
	{
		return this.usesStubFile()[0];
	}

	/**
	 * This is true if we're going to be writing meta to a "meta file".
	 *
	 * @returns {boolean}
	 * @private
	 */
	private isUsingLibFile(): boolean
	{
		return this.metaSourceFile !== undefined;
	}

	/**
	 * If this meta writer uses a stub file, we'll generate a {ts.SourceFile} from this.
	 *
	 * @returns {ts.SourceFile}
	 * @protected
	 */
	protected createLibFile(): ts.SourceFile | undefined
	{
		const [usesStub, stubFileName] = this.usesStubFile();

		if (usesStub && stubFileName)
		{
			return this.getStubFile(stubFileName);
		}

		return undefined;
	}

	/**
	 * Create a new ts.SourceFile file from our provided statements
	 *
	 * @param {ts.Statement[]} statements
	 * @protected
	 */
	protected createMetaSourceFile(statements: ts.Statement[]): ts.SourceFile
	{
		return ts.factory.createSourceFile(
			statements,
			ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
			ts.NodeFlags.None
		);
	}

	/**
	 * Create a new ts source file from our provided statements and write it to the filesystem
	 *
	 * @protected
	 */
	protected writeSourceFile(sourceFile?: ts.SourceFile): string | undefined
	{
		sourceFile = sourceFile ?? this.metaSourceFile;

		if (!sourceFile)
		{
			return;
		}

		const source = this.tsPrinter.printFile(sourceFile);

		fs.writeFileSync(this.metadataFilePath, source, { encoding: "utf8", flag: "w" });

		return source;
	}

	/**
	 * Get the import path for the meta lib, in relation to a specified source file
	 *
	 * This is used when generating imports of the meta file("src/meta-lib.ts") in our typescript sources.
	 *
	 * @param {ts.SourceFile} relativeToSourceFile
	 * @returns {string}
	 */
	private getRelativeMetaLibPath(relativeToSourceFile: ts.SourceFile): string
	{
		return getRequireRelativePath(relativeToSourceFile.fileName, this.metadataFilePath);
	}

	/**
	 * Log trace message
	 * @param message
	 * @param args
	 * @protected
	 */
	protected logMessage(message: string, ...args: any[])
	{
		if (this.context.config.debugMode)
		{
			log.log(LogLevel.Trace, color.magenta, `[${this.type}] : ${message}`, ...(args || []));
		}
	}

	/**
	 * Has the source file had meta handled for it?
	 *
	 * @param {string} filePath
	 * @returns {boolean}
	 */
	private hasWrittenMetaForFile(filePath: string): boolean
	{
		return this._addedMetaForSourceFile.includes(filePath);
	}

	/**
	 * Save that we've handled meta for the source file
	 *
	 * @param {string} filePath
	 */
	private metaWrittenForFile(filePath: string): void
	{
		this._addedMetaForSourceFile.push(filePath);
	}

	/**
	 * Check if we've added the import for the meta lib to x source file
	 *
	 * @param {string} fileName
	 * @returns {boolean}
	 */
	protected hasAddedMetaLibImport(fileName: string): boolean
	{
		return this._addedLibImport.includes(fileName);
	}

	/**
	 * Save that we've added the import for the meta lib in x source file
	 * @param {string} fileName
	 */
	protected addedMetaLibImport(fileName: string): void
	{
		this._addedLibImport.push(fileName);
	}

	get factory(): IMetadataNodeGenerator
	{
		return this.metadataNodeGenerator;
	}
}