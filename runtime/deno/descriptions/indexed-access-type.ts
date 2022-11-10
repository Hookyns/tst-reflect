import {
	LazyType,
	TypeProvider
} from "../Type.ts";
import type { Type } from "../Type.ts";

/**
 * @internal
 */
export interface IndexedAccessTypeDescription
{
	/**
	 * Object type
	 */
	ot: Type | TypeProvider;

	/**
	 * Index type
	 */
	it: Type | TypeProvider;
}

export class IndexedAccessType
{
	private readonly _objectType: LazyType;
	private readonly _indexType: LazyType;

	/**
	 * Object type
	 */
	get objectType(): Type
	{
		return this._objectType.type;
	}

	/**
	 * Index type
	 */
	get indexType(): Type
	{
		return this._indexType.type;
	}

	/**
	 * @internal
	 * @param properties
	 */
	constructor(properties: IndexedAccessTypeDescription)
	{
		this._objectType = new LazyType(properties.ot);
		this._indexType = new LazyType(properties.it);
	}
}
