import * as ts             from "typescript";
import { VisitResult }     from "typescript";
import type {
	MetadataEntry,
	TransformerVisitor
}                          from "../declarations";
import { IMetadataWriter } from "../meta-writer/IMetadataWriter";
import SourceFileContext   from "./SourceFileContext";

/**
 * Context of visitors
 */
export class Context
{
	public readonly sourceFileContext: SourceFileContext;
	private readonly _visitor: ts.Visitor;

	/**
	 * When visiting declaration bodies, names of generic types used in getType() are inserted into this array.
	 */
	public usedGenericParameters: Array<string> = [];

	get log()
	{
		return this.sourceFileContext.log;
	}

	get config()
	{
		return this.sourceFileContext.transformerContext.config;
	}

	get visitor(): ts.Visitor
	{
		return this._visitor;
	}

	get transformationContext(): ts.TransformationContext
	{
		return this.sourceFileContext.transformationContext;
	}

	get typeChecker(): ts.TypeChecker
	{
		return this.sourceFileContext.checker;
	}

	constructor(sourceFileContext: SourceFileContext, visitor: TransformerVisitor)
	{
		this.sourceFileContext = sourceFileContext;
		this._visitor = (node: ts.Node) => visitor(node, this);
	}

	visit(node: ts.Node): VisitResult<ts.Node>
	{
		return this.visitor(node);
	}

	addTypeMetadata(metadataEntry: MetadataEntry)
	{
		this.sourceFileContext.generatedTypeIds.add(metadataEntry[0]);
		this.sourceFileContext.typesMetadata.push(metadataEntry);
	}

	containsMetadataOfType(id: number): boolean
	{
		return this.sourceFileContext.generatedTypeIds.has(id);
	}

	addTypeCtor(ctorDescription: ts.PropertyAccessExpression)
	{
		if (this.sourceFileContext.typesCtors.indexOf(ctorDescription) === -1)
		{
			this.sourceFileContext.typesCtors.push(ctorDescription);
		}
	}

	visitFunctionLikeDeclaration(node: ts.FunctionLikeDeclarationBase): void
	{
		ts.visitEachChild(node, this.visitor, this.sourceFileContext.transformationContext);
	}

	createNestedContext<TReturn = undefined>(visitor: TransformerVisitor, contextAction: (context: Context) => TReturn)
	{
		const context = new Context(this.sourceFileContext, visitor);
		return contextAction(context);
	}

	get currentSourceFile(): ts.SourceFile
	{
		return this.sourceFileContext.currentSourceFile;
	}

	/**
	 * Get the metadata library writer handler
	 */
	get metaWriter(): IMetadataWriter
	{
		return this.sourceFileContext.metaWriter;
	}
}
