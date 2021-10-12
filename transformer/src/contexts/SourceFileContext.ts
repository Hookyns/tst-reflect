import * as ts            from "typescript";
import { Context }        from "./Context";
import type {
	CtorsLibrary,
	MetadataLibrary
}                         from "../declarations";
import { mainVisitor }    from "../visitors/mainVisitor";
import TransformerContext from "./TransformerContext";

export default class SourceFileContext
{
	/**
	 * Identifier of getType() function found in current file or created manually if it wasn't present in current file.
	 * @private
	 */
	private _getTypeIdentifier?: ts.Identifier;

	private _shouldGenerateGetTypeImport: boolean = false;
	private _typesMetadata: MetadataLibrary = [];
	private _ctorsLibrary: CtorsLibrary = [];
	private readonly _context: Context;

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

	get shouldGenerateGetTypeImport(): boolean
	{
		return this._shouldGenerateGetTypeImport;
	}

	/**
	 * Construct SourceFile context.
	 * @param transformerContext
	 * @param transformationContext
	 * @param program
	 * @param checker
	 */
	constructor(transformerContext: TransformerContext, transformationContext: ts.TransformationContext, program: ts.Program, checker: ts.TypeChecker)
	{
		this.transformerContext = transformerContext;
		this.transformationContext = transformationContext;
		this.program = program;
		this.checker = checker;

		this._context = new Context(this, mainVisitor);
	}

	/**
	 * Get identifier of getType() function for current file.
	 */
	getGetTypeIdentifier(): ts.Identifier
	{
		if (!this._getTypeIdentifier)
		{
			this._shouldGenerateGetTypeImport = true;
			this._getTypeIdentifier = ts.factory.createIdentifier("_tst_getType");
		}

		return this._getTypeIdentifier;
	}

	/**
	 * Try set identifier of getType() function for current
	 * @param identifier
	 * @return boolean Returns true if set, false otherwise.
	 */
	trySetGetTypeIdentifier(identifier: ts.Identifier): boolean
	{
		if (!this._getTypeIdentifier)
		{
			this._getTypeIdentifier = identifier;
			return true;
		}

		return false;
	}
}