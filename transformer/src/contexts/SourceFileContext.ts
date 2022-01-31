import * as ts                                from "typescript";
import { MetaWriter }                         from "../meta-writer/base/MetaWriter";
import { Context }                            from "./Context";
import type { CtorsLibrary, MetadataLibrary } from "../declarations";
import { mainVisitor }                        from "../visitors/mainVisitor";
import TransformerContext                     from "./TransformerContext";

export default class SourceFileContext
{
	private _typesMetadata: MetadataLibrary = [];
	private _ctorsLibrary: CtorsLibrary = [];
	private readonly _context: Context;
	private readonly _currentSourceFile: ts.SourceFile;

	public readonly transformationContext: ts.TransformationContext;
	public readonly program: ts.Program;
	public readonly checker: ts.TypeChecker;
	public readonly transformerContext: TransformerContext;

	get context(): Context
	{
		return this._context;
	}

	get typesMetadata(): MetadataLibrary
	{
		return this._typesMetadata;
	}

	get typesCtors(): CtorsLibrary
	{
		return this._ctorsLibrary;
	}

	/**
	 * Construct SourceFile context.
	 * @param transformerContext
	 * @param transformationContext
	 * @param program
	 * @param checker
	 * @param sourceFile
	 */
	constructor(
		transformerContext: TransformerContext,
		transformationContext: ts.TransformationContext,
		program: ts.Program,
		checker: ts.TypeChecker,
		sourceFile: ts.SourceFile
	)
	{
		this.transformerContext = transformerContext;
		this.transformationContext = transformationContext;
		this.program = program;
		this.checker = checker;
		this._currentSourceFile = sourceFile;

		this._context = new Context(this, mainVisitor);
	}

	get currentSourceFile(): ts.SourceFile
	{
		return this._currentSourceFile;
	}

	/**
	 * Get the metadata library writer handler
	 *
	 * @returns {MetaWriter}
	 */
	get metaWriter(): MetaWriter
	{
		return this.transformerContext.metaWriter;
	}
}
