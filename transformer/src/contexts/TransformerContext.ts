import * as ts                      from "typescript";
import {ConfigObject, createConfig} from "../config";
import MetadataGenerator            from "../MetadataGenerator";

const InstanceKey: symbol = Symbol.for("tst-reflect.TransformerContext");
let instance: TransformerContext = (global as any)[InstanceKey] || null;

export default class TransformerContext
{
	private _config?: ConfigObject;
	private _metadataGenerator?: MetadataGenerator;

	/**
	 * Get singleton instance of TransformerContext.
	 */
	static get instance(): TransformerContext
	{
		if (!instance)
		{
			instance = Reflect.construct(TransformerContext, [], Activator);
		}

		return instance;
	}

	/**
	 * Metadata library generator.
	 */
	get metadataGenerator(): MetadataGenerator | undefined
	{
		return this._metadataGenerator;
	}

	/**
	 * Configuration object.
	 */
	get config(): ConfigObject
	{
		if (!this._config)
		{
			throw new Error("TransformerContext has not been initiated yet.");
		}

		return this._config;
	}

	/**
	 * Protected constructor.
	 * @protected
	 */
	protected constructor()
	{
		if (new.target != Activator)
		{
			throw new Error("This constructor is protected.");
		}
	}

	/**
	 * Init context.
	 * @param program
	 */
	init(program: ts.Program)
	{
		this.prepareConfig(program);

		// If metadata library allowed
		if (this.config.useMetadata)
		{
			this._metadataGenerator = new MetadataGenerator(this.config.metadataFilePath);
			this._metadataGenerator.recreateLibFile();
		}
	}

	/**
	 * Prepare configuration object.
	 * @param program
	 * @private
	 */
	private prepareConfig(program: ts.Program)
	{
		const options = program.getCompilerOptions();
		const root = options.rootDir || program.getCurrentDirectory();
		this._config = createConfig(options, root);
	}
}

class Activator extends TransformerContext
{
}