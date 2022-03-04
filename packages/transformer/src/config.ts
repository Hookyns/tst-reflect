import fs                          from "fs";
import { log }                     from "./log";
import path                        from "path";
import {
	join,
	resolve
}                                  from "path";
import * as ts                     from "typescript";
import {
	ModuleKind,
	ScriptTarget
}                                  from "typescript";
import {
	DEFAULT_METADATA_TYPELIB_FILE_NAME,
	MetadataType,
	MetadataTypeValues,
	Mode,
	ModeValues
}                                  from "./config-options";
import type { PackageInfo }        from "./declarations";
import { PACKAGE_ID }              from "./helpers";
import { makeRe }                  from "minimatch";
import { MetadataMiddleware }      from "./middlewares";
import { SourceFileVisitorPlugin } from "./plugins";

const UnknownPackageName = "@@this";

type ConfigReflectionSection = {
	/**
	 * Modes "universal" or "server".
	 *
	 * "universal" is general mode for general usage on the server or in the browser.
	 *
	 * "server" is special mode for servers. Metadata contain more information which can be handy on server, eg. file paths.
	 * @default "universal"
	 */
	mode: Mode;

	/**
	 * Optional section which tells transformer how to generate metadata.
	 */
	metadata: {
		/**
		 * Types "inline" or "typelib".
		 *
		 * "inline" type means, that metadata will be generated per-file. If you use getType<>() inside your index.ts, the metadata will be generated into index.js for local usage.
		 * Using getType<>() over same type but from different file (eg. service.ts) will generate redundant metadata, same as in index.js, into service.js.
		 *
		 * "typelib" will generate one file with all of the metadata used across whole project. It is metadata library.
		 * This library is auto-imported into transpiled JS source code.
		 *
		 * @default "inline"
		 */
		type: MetadataType;

		/**
		 * Default name is "reflection.meta.js" generated into directory with tsconfig.json.
		 * You can change the name and location if it matters.
		 * @default "reflection.meta.js"
		 */
		filePath: string;

		/**
		 * Name of the runtime type factory function.
		 * @default "__τ"
		 */
		typeFactory: string;

		/**
		 * Optional list of metadata middlewares.
		 * @description It is an array of paths and/or package names.
		 */
		middlewares: string[];

		/**
		 * List of glob patterns matching modules which should be included in metadata.
		 */
		include: string[];

		/**
		 * List of glob patterns matching modules which should be excluded from metadata.
		 */
		exclude: string[];
	};

	/**
	 * List of SourceFile visiting plugins with possible transformations.
	 * @description It is an array of paths and/or package names.
	 */
	plugins: string[];

	/**
	 * Enable or disable DEBUG mode (progress logging and extra warnings).
	 * @default false
	 */
	debugMode: "true" | "false" | "0" | "1" | boolean;
}

export interface ConfigObject
{
	/**
	 * Base absolute path which will be used as root for type full names.
	 */
	rootDir: string;

	/**
	 * Output directory.
	 */
	outDir: string;

	/**
	 * Project directory.
	 * @description It is directory containing tsconfig.json in most cases.
	 */
	projectDir: string;

	/**
	 * Name of the package.
	 */
	packageName: string;

	/**
	 * Type of metadata
	 */
	metadataType: MetadataType;

	/**
	 * Path to metadata file which will be generated and will contain description of al the types.
	 */
	typeLibFilePath: string;

	/**
	 * Debug mode
	 */
	debugMode: boolean;

	/**
	 * "universal" is basic usage for both server and browser. But there will be no redundant information.
	 * "server" will have extended metadata.
	 */
	mode: Mode;

	/**
	 * Path of tsconfig.json file.
	 */
	tsConfigPath: string;

	/**
	 * TypeScript's ParsedCommandLine.
	 * @description Either a parsed command line or a parsed tsconfig.json.
	 */
	parsedCommandLine: ts.ParsedCommandLine;

	/**
	 * True if ModuleKind set to any version of ESM.
	 */
	esmModule: boolean;

	/**
	 * List of glob patterns matching modules which should be included in metadata (forced; no need to use those types).
	 */
	include: RegExp[];

	/**
	 * List of glob patterns matching modules which should be excluded from metadata.
	 */
	exclude: RegExp[];

	/**
	 * List of SourceFile visiting plugins.
	 */
	plugins: SourceFileVisitorPlugin[];

	/**
	 * List of metadata middlewares.
	 */
	metadataMiddlewares: MetadataMiddleware[];

	/**
	 * Name of the runtime type factory function.
	 */
	typeFactory: string;

	isUniversalMode(): boolean;

	isServerMode(): boolean;
}

/**
 * Returns "reflection" section from config. Assigned over default values.
 * @param {string} configPath
 * @return {ConfigReflectionSection}
 */
function getConfigReflectionSection(configPath: string): ConfigReflectionSection
{
	const result = ts.readConfigFile(configPath, ts.sys.readFile);

	if (result.error)
	{
		throw new Error(`${PACKAGE_ID}: tsconfig.json error: ${result.error.messageText}`);
	}

	const reflection = result.config?.reflection || {};
	reflection.metadata ??= {};

	return {
		mode: reflection.mode || ModeValues.universal,
		debugMode: reflection.debugMode || false,
		plugins: reflection.plugins || [],
		metadata: {
			type: reflection.metadata.type || MetadataTypeValues.inline,
			filePath: reflection.metadata.filePath?.toString() || "",
			typeFactory: reflection.typeFactory || "__τ",
			middlewares: reflection.metadata.middlewares || [],
			include: reflection.metadata.include || [],
			exclude: reflection.metadata.exclude || [],
		}
	};
}

function readConfig(configPath: string, rootDir: string)
{
	const reflection = getConfigReflectionSection(configPath);
	const modes = Object.values(ModeValues);
	const metadataTypes = Object.values(MetadataTypeValues);

	if (!modes.includes(reflection.mode))
	{
		throw new Error(`${PACKAGE_ID}: tsconfig.json error: "reflection.mode" must be one of ${modes.map(t => `"${t}"`).join(", ")}`);
	}

	if (!metadataTypes.includes(reflection.metadata.type))
	{
		throw new Error(`${PACKAGE_ID}: tsconfig.json error: "reflection.metadata.type" must be one of ${metadataTypes.map(t => `"${t}"`).join(", ")}`);
	}

	if (reflection.metadata.filePath.endsWith(".js"))
	{
		throw new Error(`${PACKAGE_ID}: tsconfig.json error: "reflection.metadata.filePath" must use the .ts extension. A .js version will be built to your projects out dir.`);
	}

	reflection.metadata.filePath = reflection.metadata.filePath ? resolve(rootDir, reflection.metadata.filePath) : join(rootDir, DEFAULT_METADATA_TYPELIB_FILE_NAME);

	return {
		mode: reflection.mode,
		metadataType: reflection.metadata.type,
		typeLibFilePath: reflection.metadata.filePath,
		debugMode: ["true", "1"].includes(reflection?.debugMode?.toString()),
		include: reflection.metadata.include,
		exclude: reflection.metadata.exclude,
		plugins: reflection.plugins,
		metadataMiddlewares: reflection.metadata.middlewares,
		typeFactory: reflection.metadata.typeFactory
	};
}

function isESMModule(options: ts.CompilerOptions)
{
	// ref: https://www.typescriptlang.org/tsconfig#module

	const target = options.target || ScriptTarget.ES3;
	const module = options.module || (
		[ScriptTarget.ES3, ScriptTarget.ES5].includes(target) ? ModuleKind.CommonJS : ModuleKind.ES2015
	);

	return [ModuleKind.ES2015, ModuleKind.ES2020, ModuleKind.ES2022, ModuleKind.ESNext].includes(module);
}


/**
 * Get name and root directory of the package.
 * @description If no package found, original root and unknown name (@@this) is returned.
 * @return {string}
 * @private
 */
function getPackage(root: string, recursiveCheck: boolean = false): PackageInfo
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
		const packageInfo = getPackage(path.normalize(path.join(root, "..")), true);

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

function getPlugin(pluginPath: string, configPath: string): SourceFileVisitorPlugin
{
	const plugin = require(path.resolve(configPath, pluginPath));

	if (!plugin)
	{
		log.error(`Invalid plugin path/name '${pluginPath}'.`);
	}

	if (!plugin.default)
	{
		log.error("Plugin must have 'default' export.");
	}

	return plugin.default;
}

function getMiddleware(middlewarePath: string, configPath: string): MetadataMiddleware
{
	const middleware = require(path.resolve(configPath, middlewarePath));

	if (!middleware)
	{
		log.error(`Invalid middleware path/name '${middlewarePath}'.`);
	}

	if (!middleware.default)
	{
		log.error("Middleware must have 'default' export.");
	}

	return middleware.default;
}

function toRegex(pattern: string): RegExp
{
	const regex = makeRe(pattern);

	if (!regex)
	{
		log.error(`Invalid glob pattern '${pattern}'.`);
		return /(?!)/;
	}

	return regex;
}

function prepareConfig(options: ts.CompilerOptions, rootDir: string, packageInfo: PackageInfo): ConfigObject
{
	const rawConfigObject = options as any;
	const configPath = rawConfigObject.configFilePath;
	const config = readConfig(configPath, rootDir);

	return {
		rootDir: packageInfo.rootDir,
		outDir: options.outDir || rootDir,
		projectDir: rootDir,
		packageName: packageInfo.name,

		mode: config.mode,
		metadataType: config.metadataType,
		typeLibFilePath: config.typeLibFilePath,
		typeFactory: config.typeFactory,
		include: config.include.map(pattern => toRegex(pattern)),
		exclude: config.exclude.map(pattern => toRegex(pattern)),
		plugins: config.plugins.map(plugin => getPlugin(plugin, configPath)),
		metadataMiddlewares: config.metadataMiddlewares.map(middleware => getMiddleware(middleware, configPath)),
		debugMode: config.debugMode,

		parsedCommandLine: ts.getParsedCommandLineOfConfigFile(configPath, undefined, ts.sys as any) || { options, fileNames: [], errors: [] },
		tsConfigPath: configPath,
		esmModule: isESMModule(options),

		isUniversalMode(): boolean
		{
			return config.mode === ModeValues.universal;
		},
		isServerMode(): boolean
		{
			return config.mode === ModeValues.server;
		},
	};
}

export function createConfig(program: ts.Program): ConfigObject
{
	const tsConfig = program.getCompilerOptions();
	const rootDir = path.resolve(tsConfig.rootDir || program.getCurrentDirectory());
	const packageInfo = getPackage(rootDir);
	return prepareConfig(tsConfig, rootDir, packageInfo);
}