import * as ts                from "typescript";
import { MetadataLibrary }    from "../metadata/MetadataLibrary";
import { Context }            from "./Context";
import { Logger }             from "../log";
import { mainVisitor }        from "../visitors/mainVisitor";
import { TransformerContext } from "./TransformerContext";

export class SourceFileContext
{
	private readonly _context: Context;
	private readonly _sourceFile: ts.SourceFile;
	private readonly _metadata: MetadataLibrary;

	public readonly transformationContext: ts.TransformationContext;
	public readonly program: ts.Program;
	public readonly checker: ts.TypeChecker;
	public readonly transformerContext: TransformerContext;
	public readonly log: Logger;

	/**
	 * Current context.
	 */
	get context(): Context
	{
		return this._context;
	}

	/**
	 * Metadata library.
	 */
	get metadata(): MetadataLibrary
	{
		return this._metadata;
	}

	/**
	 * Construct SourceFile context.
	 * @param sourceFile
	 * @param transformerContext
	 * @param transformationContext
	 */
	constructor(
		sourceFile: ts.SourceFile,
		transformerContext: TransformerContext,
		transformationContext: ts.TransformationContext
	)
	{
		this.log = new Logger(sourceFile.fileName);
		this.transformerContext = transformerContext;
		this.transformationContext = transformationContext;
		this.program = transformerContext.program;
		this.checker = transformerContext.checker;
		this._metadata = transformerContext.metadata;
		this._sourceFile = sourceFile;

		this._context = new Context(this, mainVisitor);
	}

	get sourceFile(): ts.SourceFile
	{
		return this._sourceFile;
	}

	// /**
	//  * Get the metadata library writer handler
	//  */
	// get metaWriter(): IMetadataWriter
	// {
	// 	return this.transformerContext.metaWriter;
	// }
}