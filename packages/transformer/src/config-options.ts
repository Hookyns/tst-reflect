export const ModeValues = {
	/**
	 * Universal mode
	 */
	universal: "universal",

	/**
	 * Server mode
	 * @description Server mode generates extra metadata which are useless in browser.
	 */
	server: "server"
} as const;

export type Mode = typeof ModeValues[keyof typeof ModeValues];

export const MetadataTypeValues = {
	inline: "inline",

	/**
	 * Type Database
	 */
	typeLib: "typelib"
} as const;

export type MetadataType = typeof MetadataTypeValues[keyof typeof MetadataTypeValues];

/**
 * Default name of the matadata library file.
 * @type {string}
 */
export const DEFAULT_METADATA_TYPELIB_FILE_NAME = "reflection.meta.ts"; // TODO: Check if it rly should be .TS, not .JS