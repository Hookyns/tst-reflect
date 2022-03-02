import * as ts                      from "typescript";
import { TransformerContext }       from "../contexts/TransformerContext";
import { TransformerTypeReference } from "../declarations";
import { MetadataWriterFactory }    from "../meta-writer/factories/MetadataWriterFactory";
import { IMetadataWriter }          from "../meta-writer/IMetadataWriter";
import { MetadataFactory }          from "./MetadataFactory";
import { ModuleMetadata }           from "./ModuleMetadata";

const InstanceKey: symbol = Symbol.for("tst-reflect.MetadataLibrary");
let instance: MetadataLibrary = (global as any)[InstanceKey] || null;

export class MetadataLibrary
{
	/**
	 * Map of "touched" SourceFiles/Modules.
	 */
	private readonly modules = new Map<ts.SourceFile, ModuleMetadata>();

	/**
	 * Metadata factory.
	 */
	public readonly factory: MetadataFactory;

	/**
	 * Map of types used in which SourceFile.
	 * @private
	 */
	private readonly sourceFileContextTypes = new Map<ts.SourceFile, TransformerTypeReference[]>();

	/**
	 * Metadata writer.
	 */
	public readonly writer: IMetadataWriter;

	/**
	 * @protected
	 */
	protected constructor(private readonly context: TransformerContext)
	{
		if (new.target != Activator)
		{
			throw new Error("This constructor is protected.");
		}

		this.factory = new MetadataFactory(this, context);
		this.writer = MetadataWriterFactory.create(context);
	}

	/**
	 * Get singleton instance of MetadataLibrary.
	 */
	static get instance(): MetadataLibrary
	{
		if (!instance)
		{
			throw new Error("tst-reflect: MetadataLibrary hasn't been initiated yet!");
		}

		return instance;
	}

	/**
	 * Init Metadata library.
	 * @param context
	 */
	static init(context: TransformerContext)
	{
		if (!instance)
		{
			instance = Reflect.construct(MetadataLibrary, [context], Activator) as MetadataLibrary;
		}

		return instance;
	}

	/**
	 * Get all the modules generated to this time.
	 */
	getModules(): IterableIterator<ModuleMetadata>
	{
		return this.modules.values();
	}

	/**
	 * Add type into the module metadata and return its properties.
	 * @param typeNode
	 * @param type
	 */
	addType(typeNode: ts.TypeNode, type?: ts.Type): TransformerTypeReference
	{
		type ??= this.context.checker.getTypeAtLocation(typeNode);
		const sourceFile = typeNode.getSourceFile();

		let existingModule = this.modules.get(sourceFile);

		if (!existingModule)
		{
			existingModule = new ModuleMetadata(this.context, sourceFile);
			this.modules.set(sourceFile, existingModule);
		}

		const typeRef = existingModule.addType(typeNode, type);
		const sourceFileContext = this.context.currentSourceFileContext;

		if (typeof typeRef === "number" && sourceFileContext)
		{
			let typeRefs = this.sourceFileContextTypes.get(sourceFileContext.sourceFile);

			if (!typeRefs)
			{
				typeRefs = [];
				this.sourceFileContextTypes.set(sourceFileContext.sourceFile, typeRefs);
			}

			typeRefs.push(typeRef);
		}

		return typeRef;
	}

	/**
	 * Returns list of type references used inside given SourceFile.
	 * @param sourceFile
	 */
	getInFileTypes(sourceFile: ts.SourceFile)
	{
		return this.sourceFileContextTypes.get(sourceFile) || [];
	}
}

class Activator extends MetadataLibrary
{
}