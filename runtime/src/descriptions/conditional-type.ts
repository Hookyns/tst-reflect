import {
	LazyType,
	TypeProvider
}                    from "../Type";
import type { Type } from "../Type";

/**
 * @internal
 */
export interface ConditionalTypeDescription
{
	/**
	 * Extends type
	 */
	e: Type | TypeProvider;

	/**
	 * True type
	 */
	tt: Type | TypeProvider;

	/**
	 * False type
	 */
	ft: Type | TypeProvider;
}

export class ConditionalType
{
	private readonly _extends: LazyType;
	private readonly _trueType: LazyType;
	private readonly _falseType: LazyType;

	/**
	 * Extends type
	 */
	get extends(): Type
	{
		return this._extends.type;
	}

	/**
	 * True type
	 */
	get trueType(): Type
	{
		return this._trueType.type;
	}

	/**
	 * False type
	 */
	get falseType(): Type
	{
		return this._falseType.type;
	}

	/**
	 * @internal
	 * @param properties
	 */
	constructor(properties: ConditionalTypeDescription)
	{
		this._extends = new LazyType(properties.e);
		this._trueType = new LazyType(properties.tt);
		this._falseType = new LazyType(properties.ft);
	}
}
