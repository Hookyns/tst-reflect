import { Metadata }      from "../index";
import type { Type }     from "../Type";
import { TypeReference } from "./declarations";

export class GenericInfo
{
	private readonly _constraintReference?: TypeReference;
	private readonly _defaultReference?: TypeReference;

	private _constraint?: Type;
	private _default?: Type;

	get constraint(): Type | undefined
	{
		if (!this._constraintReference)
		{
			return undefined;
		}

		return this._constraint ?? (this._constraint = Metadata.resolveType(this._constraintReference));
	}

	get default(): Type | undefined
	{
		if (!this._defaultReference)
		{
			return undefined;
		}

		return this._default ?? (this._default = Metadata.resolveType(this._defaultReference));
	}

	/**
	 * @param initializer
	 */
	constructor(initializer: GenericInfoInitializer)
	{
		this._constraintReference = initializer.constraint;
		this._defaultReference = initializer.default;
	}
}

export interface GenericInfoInitializer
{
	constraint?: TypeReference;
	default?: TypeReference;
}