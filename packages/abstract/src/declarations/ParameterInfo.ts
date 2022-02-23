import { Metadata }      from "../index";
import type { Type }     from "../Type";
import { TypeReference } from "./declarations";

/**
 * Details about parameter of method, function or constructor.
 */
export class ParameterInfo
{
	private readonly _typeReference: TypeReference;
	private _type?: Type;

	/**
	 * Parameter name
	 */
	readonly name: string;

	/**
	 * Parameter is optional
	 */
	readonly optional: boolean;

	/**
	 * Parameter is rest
	 */
	readonly rest: boolean;

	/**
	 * Type of the parameter
	 */
	get type(): Type
	{
		return this._type ?? (this._type = Metadata.resolveType(this._typeReference));
	}

	/**
	 * @param initializer
	 */
	constructor(initializer: ParameterInfoInitializer)
	{
		this.name = initializer.name;
		this._typeReference = initializer.type;
		this.optional = !!initializer.optional;
		this.rest = !!initializer.rest;
	}
}

export interface ParameterInfoInitializer
{
	name: string;
	type: TypeReference;
	optional?: boolean;
	rest?: boolean;
}