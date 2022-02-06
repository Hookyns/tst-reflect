import type { Type } from "../Type";

/**
 * @internal
 */
export interface IndexedAccessTypeDescription
{
	/**
	 * Object type
	 */
	ot: Type;

	/**
	 * Index type
	 */
	it: Type;
}

export interface IndexedAccessType
{
	/**
	 * Object type
	 */
	objectType: Type;

	/**
	 * Index type
	 */
	indexType: Type;
}
