import { Metadata }      from "../index";
import type { Type }     from "../Type";
import { TypeReference } from "./declarations";

export class ConditionInfo
{
	private readonly _extendsReference: TypeReference;
	private readonly _trueTypeReference: TypeReference;
	private readonly _falseTypeReference: TypeReference;

	private _extends?: Type;
	private _trueType?: Type;
	private _falseType?: Type;

	/**
	 * Extends type
	 */
	get extends(): Type
	{
		return this._extends ?? (this._extends = Metadata.resolveType(this._extendsReference));
	}

	/**
	 * True type
	 */
	get trueType(): Type
	{
		return this._trueType ?? (this._trueType = Metadata.resolveType(this._trueTypeReference));
	}

	/**
	 * False type
	 */
	get falseType(): Type
	{
		return this._falseType ?? (this._falseType = Metadata.resolveType(this._falseTypeReference));
	}

	/**
	 * @param initializer
	 */
	constructor(initializer: ConditionInfoInitializer)
	{
		this._extendsReference = initializer.extends;
		this._trueTypeReference = initializer.trueType;
		this._falseTypeReference = initializer.falseType;
	}
}

export interface ConditionInfoInitializer
{
	extends: TypeReference;
	trueType: TypeReference;
	falseType: TypeReference;
}