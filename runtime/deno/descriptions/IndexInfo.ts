import {
	LazyType,
	TypeProvider
} from "../Type.ts";
import type { Type } from "../Type.ts";

/**
 * @internal
 */
export interface IndexDescription
{
	/**
	 * Index key type
	 */
	k: Type | TypeProvider;

	/**
	 * Index value type
	 */
	t: Type | TypeProvider;

	/**
	 * Readonly
	 */
	ro?: boolean;
}

/**
 * Index description
 */
export class IndexInfo
{
	private readonly _keyType: LazyType;
	private readonly _type: LazyType;

	/**
	 * Index key type
	 */
	get keyType(): Type
	{
		return this._keyType.type;
	}

	/**
	 * Index value type
	 */
	get type(): Type
	{
		return this._type.type;
	}

	/**
	 * Readonly
	 */
	readonly readonly: boolean;

	/**
	 * @param description
	 * @internal
	 */
	constructor(description: IndexDescription)
	{
		this._keyType = new LazyType(description.k);
		this._type = new LazyType(description.t);
		this.readonly = description.ro ?? false;
	}
}