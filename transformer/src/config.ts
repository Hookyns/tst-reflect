import {
	join,
	resolve
}                         from "path";
import * as ts            from "typescript";
import {
	ModuleKind,
	ScriptTarget
}                         from "typescript";
import {
	DEFAULT_METADATA_LIB_FILE_NAME,
	MetadataType,
	MetadataTypeValues,
	Mode,
	ModeValues
}                         from "./config-options";
import { PackageInfo }    from "./declarations";
import { PACKAGE_ID }     from "./helpers";

type ConfigReflectionSection = {
	/**
	 * Modes "universal" or "server".
	 *
	 * "universal" is general mode for general usage on the server or in the browser.
	 *
	 * "server" is special mode for servers. Metadata contain more information which can be handy on server, eg. file paths.
	 * @default "universal"
	 */
	mode: Mode,

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
		type: MetadataType,

		/**
		 * Default name is "reflection.meta.js" generated into directory with tsconfig.json.
		 * You can change the name and location if it matters.
		 */
		filePath: string
	},

	debugMode: "true" | "false" | "0" | "1" | boolean
}

export interface ConfigObject
{
	/**
	 * Base absolute path which will be used as root for type full names.
	 */
	rootDir: string;

	/**
	 * Path of tsconfig.json file.
	 */
	tsConfigPath: string;

	/**
	 * True if ModuleKind set to any version of ESM.
	 */
	esmModuleKind: boolean;

	/**
	 * Module resolution kind.
	 */
	moduleResolution: ts.ModuleResolutionKind;

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
	 * Generation of metadata file is enabled/disabled
	 */
	useMetadata: boolean;


	useMetadataType: MetadataType;

	/**
	 * Path to metadata file which will be generated and will contain description of al the types.
	 */
	metadataFilePath: string;

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
	 * TypeScript's ParsedCommandLine.
	 * @description Either a parsed command line or a parsed tsconfig.json.
	 */
	parsedCommandLine?: ts.ParsedCommandLine;

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

	return {
		mode: reflection.mode || ModeValues.universal,
		debugMode: reflection.debugMode || false,
		metadata: {
			type: reflection.metadata?.type || MetadataTypeValues.inline,
			filePath: reflection.metadata?.filePath?.toString() || ""
		}
	};
}

function readConfig(configPath: string, rootDir: string): {
	metadataFilePath: string,
	useMetadata: boolean,
	useMetadataType: MetadataType,
	debugMode: boolean,
	mode: Mode
}
{
	const reflection = getConfigReflectionSection(configPath);
	const modes = Object.values(ModeValues);
	const metadataTypes = Object.values(MetadataTypeValues);

	if (!modes.includes(reflection.mode))
	{
		throw new Error(`${PACKAGE_ID}: tsconfig.json error: "reflection.mode" must be one of ${modes.map(t => `"${t}"`)
			.join(", ")}`);
	}

	if (!metadataTypes.includes(reflection.metadata.type))
	{
		throw new Error(`${PACKAGE_ID}: tsconfig.json error: "reflection.metadata.type" must be one of ${metadataTypes.map(
			t => `"${t}"`).join(", ")}`);
	}

	if (reflection.metadata.filePath.endsWith(".js"))
	{
		throw new Error(`${PACKAGE_ID}: tsconfig.json error: "reflection.metadata.filePath" must use the .ts extension. A .js version will be built to your projects out dir.`);
	}

	reflection.metadata.filePath = reflection.metadata.filePath ? resolve(rootDir, reflection.metadata.filePath) : join(
		rootDir,
		DEFAULT_METADATA_LIB_FILE_NAME
	);

	return {
		mode: reflection.mode,
		useMetadata: reflection.metadata.type !== MetadataTypeValues.inline,
		useMetadataType: reflection.metadata.type,
		metadataFilePath: reflection.metadata.filePath,
		debugMode: ["true", "1"].includes(reflection?.debugMode?.toString()),
	};
}

export function createConfig(options: ts.CompilerOptions, rootDir: string, packageInfo: PackageInfo): ConfigObject
{
	const rawConfigObject = options as any;
	const configPath = rawConfigObject.configFilePath;
	const config = readConfig(configPath, rootDir);

	return {
		mode: config.mode,
		rootDir: packageInfo.rootDir,
		outDir: options.outDir || rootDir,
		tsConfigPath: configPath,
		esmModuleKind: isESMModule(options),
		moduleResolution: getModuleResolutionKind(options),
		projectDir: rootDir,
		packageName: packageInfo.name,
		useMetadata: config.useMetadata,
		useMetadataType: config.useMetadataType,
		metadataFilePath: config.metadataFilePath,
		debugMode: config.debugMode,
		parsedCommandLine: ts.getParsedCommandLineOfConfigFile(configPath, undefined, ts.sys as any),
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

function getModuleResolutionKind(options: ts.CompilerOptions)
{
	return (ts as any).getEmitModuleResolutionKind?.(options)
		?? options.moduleResolution
		?? ts.ModuleResolutionKind.Classic;
}

function isESMModule(options: ts.CompilerOptions)
{
	// ref: https://www.typescriptlang.org/tsconfig#module

	const target = options.target || ScriptTarget.ES3;
	const module = options.module || (
		[ScriptTarget.ES3, ScriptTarget.ES5].includes(target) ? ModuleKind.CommonJS : ModuleKind.ES2015
	);

	return [ModuleKind.ES2015, ModuleKind.ES2020, ModuleKind.ES2022, ModuleKind.ESNext, ModuleKind.NodeNext].includes(
		module);
}
