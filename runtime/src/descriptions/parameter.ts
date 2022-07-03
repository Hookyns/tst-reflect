import {
	LazyType,
	TypeProvider
}                    from "../Type";
import type { Type } from "../Type";

/**
 * @internal
 */
export interface ParameterDescription
{
	/**
	 * Name of the parameter
	 */
	n: string;

	/**
	 * Type of the parameter
	 */
	t: Type | TypeProvider;

	/**
	 * Optional parameter
	 */
	o: boolean;
}

/**
 * Method parameter description
 */
export class MethodParameter
{
	private readonly _type: LazyType;

	/**
	 * Parameter name
	 */
	public readonly name: string;

	/**
	 * Parameter type
	 */
	get type(): Type
	{
		return this._type.type;
	}

	/**
	 * Parameter is optional
	 */
	public readonly optional: boolean;

	/**
	 * @internal
	 * @param properties
	 */
	constructor(properties: ParameterDescription)
	{
		this._type = new LazyType(properties.t);
		this.name = properties.n;
		this.optional = properties.o;
	}
}
