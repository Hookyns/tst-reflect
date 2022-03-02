import * as ts                    from "typescript";
import {
	ConfigObject,
	createConfig
}                                 from "../config";
import { MetadataLibrary }        from "../metadata/MetadataLibrary";
import type { SourceFileContext } from "./SourceFileContext";

const InstanceKey: symbol = Symbol.for("tst-reflect.TransformerContext");
let instance: TransformerContext = (global as any)[InstanceKey] || null;

export class TransformerContext
{
	// private _metaWriter?: IMetadataWriter;

	/**
	 * SourceFile context set for each visiting SourceFile.
	 * @private
	 */
	private sourceFileContext?: SourceFileContext;

	/**
	 * TypeScript Program.
	 */
	public program: ts.Program;

	/**
	 * Configuration object.
	 */
	public config: ConfigObject;

	/**
	 * TypeScript CompilerOptions.
	 */
	public tsConfig: ts.CompilerOptions;

	/**
	 * TypeScript type checker.
	 */
	public readonly checker: ts.TypeChecker;

	/**
	 * Metadata library.
	 */
	public readonly metadata: MetadataLibrary;

	/**
	 * Get singleton instance of TransformerContext.
	 */
	static get instance(): TransformerContext
	{
		if (!instance)
		{
			throw new Error("tst-reflect: TransformerContext hasn't been initiated yet!");
		}

		return instance;
	}

	/**
	 * SourceFile context set for each visiting SourceFile.
	 */
	get currentSourceFileContext(): SourceFileContext | undefined
	{
		return this.sourceFileContext;
	}

	// /**
	//  * Get the metadata library writer handler
	//  *
	//  * @returns {IMetadataWriter}
	//  */
	// get metaWriter(): IMetadataWriter
	// {
	// 	if (!this._metaWriter)
	// 	{
	// 		throw new Error("TransformerContext has not been initiated yet.");
	// 	}
	//
	// 	return this._metaWriter;
	// }

	/**
	 * Protected constructor.
	 * @protected
	 */
	protected constructor(program: ts.Program, config: ConfigObject)
	{
		if (new.target != Activator)
		{
			throw new Error("This constructor is protected.");
		}

		this.program = program;
		this.config = config;
		this.tsConfig = config.parsedCommandLine.options;
		this.checker = program.getTypeChecker();
		this.metadata = MetadataLibrary.init(this);
	}

	/**
	 * Init context.
	 * @param program
	 */
	static init(program: ts.Program)
	{
		const config = createConfig(program);

		// // If metadata library allowed
		// if (!this._metaWriter)
		// {
		// 	this._metaWriter = MetadataWriterFactory.create(this);
		// }

		instance = Reflect.construct(TransformerContext, [
			program,
			config
		], Activator);
	}

	/**
	 * @internal
	 * @param context
	 */
	setSourceFileContext(context: SourceFileContext)
	{
		this.sourceFileContext = context;
	}
}

class Activator extends TransformerContext
{
}
