import * as ts             from "typescript";
import {SourceFileContext} from "../declarations";
import {mainVisitor}       from "./mainVisitor";

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
	 */
	constructor(transformationContext: ts.TransformationContext, program: ts.Program, checker: ts.TypeChecker)
	{
		this.transformationContext = transformationContext;
		this.program = program;
		this.checker = checker;

		this.sourceFileVisitor = this.sourceFileVisitor.bind(this);

		this.sourceFileContext = {
			typesProperties: [],
			visitor: this.sourceFileVisitor
		};
	}

	private sourceFileVisitor(node: ts.Node)
	{
		return mainVisitor(node, this);
	}
}