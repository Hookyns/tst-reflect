import {
	dirname,
	join,
	resolve
}                      from "path";
import * as ts         from "typescript";
import {
	DEFAULT_METADATA_LIB_FILE_NAME,
	MetadataType,
	MetadataTypeValues,
	Mode,
	ModeValues
}                      from "./config-options";
import { PackageInfo } from "./declarations";
import { PACKAGE_ID }  from "./helpers";

type ConfigReflectionSection = {
	mode: Mode,
	metadata: {
		type: MetadataType,
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

	reflection.metadata.filePath = reflection.metadata.filePath ? resolve(rootDir, reflection.metadata.filePath) : join(rootDir, DEFAULT_METADATA_LIB_FILE_NAME);

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
		projectDir: rootDir,
		packageName: packageInfo.name,
		useMetadata: config.useMetadata,
		useMetadataType: config.useMetadataType,
		metadataFilePath: config.metadataFilePath,
		debugMode: config.debugMode,
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
