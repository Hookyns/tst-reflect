import * as ts                   from "typescript";
import * as fs                   from "fs";
import * as path                 from "path";
import {
	ConfigObject,
	createConfig
}                                from "../config";
import { PackageInfo }           from "../declarations";
import { IMetadataWriter }       from "../meta-writer/IMetadataWriter";
import { MetadataWriterFactory } from "../meta-writer/factories/MetaDataWriterFactory";

const UnknownPackageName = "@@this";
const InstanceKey: symbol = Symbol.for("tst-reflect.TransformerContext");
let instance: TransformerContext = (global as any)[InstanceKey] || null;

export default class TransformerContext
{
	private _tsConfig?: ts.CompilerOptions;
	private _config?: ConfigObject;
	private _metaWriter?: IMetadataWriter;

	public program?: ts.Program;

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
	 * Get the metadata library writer handler
	 *
	 * @returns {IMetadataWriter}
	 */
	get metaWriter(): IMetadataWriter
	{
		if (!this._metaWriter)
		{
			throw new Error("TransformerContext has not been initiated yet.");
		}

		return this._metaWriter;
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
	 * TypeScript CompilerOptions.
	 */
	get tsConfig(): ts.CompilerOptions
	{
		if (!this._tsConfig)
		{
			throw new Error("TransformerContext has not been initiated yet.");
		}

		return this._tsConfig;
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
		this.program = program;

		// If metadata library allowed
		if (!this._metaWriter)
		{
			this._metaWriter = MetadataWriterFactory.create(this);
		}
	}

	/**
	 * Prepare configuration object.
	 * @param program
	 * @private
	 */
	private prepareConfig(program: ts.Program)
	{
		this._tsConfig = program.getCompilerOptions();
		const rootDir = path.resolve(this._tsConfig.rootDir || program.getCurrentDirectory());
		const packageInfo = this.getPackage(rootDir);
		this._config = createConfig(this._tsConfig, rootDir, packageInfo);
	}

	/**
	 * Get name and root directory of the package.
	 * @description If no package found, original root and unknown name (@@this) is returned.
	 * @return {string}
	 * @private
	 */
	private getPackage(root: string, recursiveCheck: boolean = false): PackageInfo
	{
		try
		{
			const packageJson = fs.readFileSync(path.join(root, "package.json"), "utf-8");
			return { rootDir: root, name: JSON.parse(packageJson).name || UnknownPackageName };
		}
		catch (e)
		{
			if (path.parse(root).root == root)
			{
				// as any -> internal
				return { rootDir: undefined as any, name: UnknownPackageName };
			}

			// Try to get parent folder package
			const packageInfo = this.getPackage(path.normalize(path.join(root, "..")), true);
			
			if (packageInfo.rootDir == undefined)
			{
				// If this is recursive check, return undefined root as received from parent folder check
				if (recursiveCheck)
				{
					return packageInfo;
				}

				// This is top level check; return original root passed as argument
				return { rootDir: root, name: packageInfo.name };
			}

			return packageInfo;
		}
	}
}

class Activator extends TransformerContext
{
}
