import {
	join,
	dirname,
	resolve
}              from "path";
import * as ts from "typescript";

export interface ConfigObject
{
	/**
	 * Base absolute path which will be used as root for type full names.
	 */
	rootDir: string;

	/**
	 * Name of the package.
	 */
	packageName: string;

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

	/**
	 * "universal" is basic usage for both server and browser. But there will be no redundant information.
	 * "server" will have extended metadata.
	 */
	mode: "server" | "universal";

	isUniversalMode(): boolean;

	isServerMode(): boolean;
}

let config: ConfigObject = {
	get rootDir(): string
	{
		throw new Error("Configuration not loaded yet.");
	},
	get packageName(): string
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
	get mode(): "server" | "universal"
	{
		throw new Error("Configuration not loaded yet.");
	},
	isUniversalMode(): boolean
	{
		throw new Error("Configuration not loaded yet.");
	},
	isServerMode(): boolean
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
	debugMode: boolean,
	mode: "server" | "universal"
}
{
	const result = ts.readConfigFile(configPath, ts.sys.readFile);

	if (result.error)
	{
		throw new Error("tsconfig.json error: " + result.error.messageText);
	}

	const reflection = result.config?.reflection;
	const useMetadata = !["false", "0"].includes(reflection?.metadata?.toString());

	if (useMetadata && reflection.metadata != undefined && (typeof reflection.metadata != "string" || !reflection.metadata.endsWith(".js")))
	{
		throw new Error("tsconfig.json error: 'reflection.metadata' must be falsy or it must be path to .js file.");
	}

	return {
		mode: ["server", "universal"].includes(reflection?.mode) ? reflection?.mode : "universal",
		useMetadata: useMetadata,
		metadataFilePath: reflection?.metadata ? resolve(projectPath, reflection.metadata) : join(rootDir, "metadata.lib.js"),
		debugMode: ["true", "1"].includes(reflection?.debugMode?.toString()),
	};
}

export function getConfig()
{
	return config;
}

export function createConfig(options: ts.CompilerOptions, root: string, packageName: string): ConfigObject
{
	const rawConfigObject = options as any;
	const configPath = rawConfigObject.configFilePath;
	const config = readConfig(configPath, dirname(configPath), root);

	return {
		mode: config.mode,
		rootDir: root,
		packageName: packageName,
		useMetadata: config.useMetadata,
		metadataFilePath: config.metadataFilePath,
		debugMode: config.debugMode,
		isUniversalMode(): boolean
		{
			return config.mode === "universal";
		},
		isServerMode(): boolean
		{
			return config.mode === "server";
		},
	};
}
