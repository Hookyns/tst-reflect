﻿export interface ConfigObject {
	/**
	 * Base absolute path which will be used as root for type full names
	 */
	rootDir?: string;
}

let config: ConfigObject = {};

export function setConfig(c: ConfigObject) {
	config = c;
}

export function getConfig() {
	return config;
}