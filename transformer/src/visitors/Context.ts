import {SourceFileContext} from "../declarations";
import * as ts             from "typescript";

/**
 * Context of visitors
 */
export class Context
{
	/**
	 * Current scope visitor
	 */
	private _visitor?: ts.Visitor;

	public readonly sourceFileContext: SourceFileContext;
	public readonly transformationContext: ts.TransformationContext;
	public readonly program: ts.Program;
	public readonly checker: ts.TypeChecker;

	/**
	 * Get visitor
	 */
	public get visitor(): ts.Visitor
	{
		return this._visitor || this.sourceFileContext.visitor;
	}

	/**
	 * Set TMP visitor for current context
	 * @param visitor
	 */
	public set visitor(visitor: ts.Visitor)
	{
		this._visitor = visitor;
	}

	/**
	 * When visiting bodies, names of generic types used in getType() are inserted into this array.
	 * Resetting on method/function declaration.
	 */
	public usedGenericParameters?: Array<string>;

	/**
	 * Ctor
	 * @param transformationContext
	 * @param program
	 * @param checker
	 * @param sourceFileContext
	 */
	constructor(transformationContext: ts.TransformationContext, program: ts.Program, checker: ts.TypeChecker, sourceFileContext: SourceFileContext)
	{
		this.transformationContext = transformationContext;
		this.program = program;
		this.checker = checker;
		this.sourceFileContext = sourceFileContext;
	}
}