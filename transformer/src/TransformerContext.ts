import * as ts                      from "typescript";
import * as fs                      from "fs";
import {ConfigObject, createConfig} from "./config";
import MetadataGenerator            from "./MetadataGenerator";

class TransformerContext
{
	private _config?: ConfigObject;
	private _metadataGenerator?: MetadataGenerator;

	/**
	 * Metadata library generator.
	 */
	get metadataGenerator(): MetadataGenerator | undefined
	{
		return this._metadataGenerator;
	}

	/**
	 * Configuration object
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
	 * Init context
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

export const transformerContext = new TransformerContext();