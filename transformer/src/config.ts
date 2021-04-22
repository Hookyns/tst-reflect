import {join, dirname, resolve} from "path";
import * as ts                  from "typescript";

export interface ConfigObject
{
	/**
	 * Base absolute path which will be used as root for type full names.
	 */
	rootDir: string;

	/**
	 * Generation of metadata file is enabled/disabled
	 */
	useMetadata: boolean;

	/**
	 * Path to metadata file which will be generated and will contain description of al the types.
	 */
	metadataFilePath: string;

	/**
	 * Debug mode
	 */
	debugMode: boolean;
}

let config: ConfigObject = {
	get rootDir(): string
	{
		throw new Error("Configuration not loaded yet.");
	},
	get useMetadata(): boolean
	{
		throw new Error("Configuration not loaded yet.");
	},
	get metadataFilePath(): string
	{
		throw new Error("Configuration not loaded yet.");
	},
	get debugMode(): boolean
	{
		throw new Error("Configuration not loaded yet.");
	},
};

function setConfig(c: ConfigObject)
{
	config = c;
}

function readConfig(configPath: string, projectPath: string, rootDir: string): {
	metadataFilePath: string,
	useMetadata: boolean,
	debugMode: boolean
}
{
	const result = ts.readConfigFile(configPath, ts.sys.readFile);

	if (result.error)
	{
		throw new Error("tsconfig.json error: " + result.error.messageText);
	}

	const reflection = result.config?.reflection;

	return {
		useMetadata: !["false", "0"].includes(reflection?.metadata?.toString()),
		metadataFilePath: reflection?.metadata ? resolve(projectPath, reflection.metadata) : join(rootDir, "metadata.lib.js"),
		debugMode: ["true", "1"].includes(reflection?.debugMode?.toString()),
	}
}

export function getConfig()
{
	return config;
}

export function createConfig(options: ts.CompilerOptions, root: string)
{
	const rawConfigObject = options as any;
	const configPath = rawConfigObject.configFilePath;
	const config = readConfig(configPath, dirname(configPath), root);

	return {
		rootDir: root,
		useMetadata: config.useMetadata,
		metadataFilePath: config.metadataFilePath,
		debugMode: config.debugMode,
	};
}