import * as ts                                  from "typescript";
import SourceFileContext                        from "./SourceFileContext";
import type {MetadataEntry, TransformerVisitor} from "../declarations";

/**
 * Context of visitors
 */
export class Context
{
	private readonly _sourceFileContext: SourceFileContext;
	private readonly _visitor: ts.Visitor;
	private readonly _transformerVisitor: TransformerVisitor;

	/**
	 * When visiting bodies, names of generic types used in getType() are inserted into this array.
	 * Resetting on method/function declaration.
	 */
	public usedGenericParameters?: Array<string>;

	get config()
	{
		return this._sourceFileContext.transformerContext.config;
	}

	get visitor(): ts.Visitor
	{
		return this._visitor;
	}

	get transformationContext(): ts.TransformationContext
	{
		return this._sourceFileContext.transformationContext;
	}

	get typeChecker(): ts.TypeChecker
	{
		return this._sourceFileContext.checker;
	}

	constructor(sourceFileContext: SourceFileContext, visitor: TransformerVisitor)
	{
		this._sourceFileContext = sourceFileContext;
		this._transformerVisitor = visitor;
		this._visitor = (node: ts.Node) => visitor(node, this);
	}

	visit(node: ts.Node)//: ts.Node | undefined
	{
		return this.visitor(node);
	}

	addTypeMetadata(metadataEntry: MetadataEntry)
	{
		this._sourceFileContext.typesMetadata.push(metadataEntry);
	}

	addTypeCtor(typeCtor: ts.EntityName)
	{
		this._sourceFileContext.typesCtors.push(typeCtor);
	}

	visitEachChild(node: ts.FunctionLikeDeclarationBase)
	{
		// const context = new Context(this.sourceFileContext, mainVisitor);
		const visitedNode = ts.visitEachChild(node, this.visitor, this._sourceFileContext.transformationContext);
		return visitedNode;
	}

	createNestedContext<TReturn = undefined>(visitor: TransformerVisitor, contextAction: (context: Context) => TReturn)
	{
		const context = new Context(this._sourceFileContext, visitor);
		return contextAction(context);
	}

	/**
	 * Get identifier of getType() function for current file.
	 */
	getGetTypeIdentifier(): ts.Identifier
	{
		return this._sourceFileContext.getGetTypeIdentifier();
	}

	/**
	 * Try set identifier of getType() function for current
	 * @param identifier
	 * @return boolean Returns true if set, false otherwise.
	 */
	trySetGetTypeIdentifier(identifier: ts.Identifier): boolean
	{
		return this._sourceFileContext.trySetGetTypeIdentifier(identifier);
	}
}