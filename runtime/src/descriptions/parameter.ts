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

	/**
	 * Is variadic (e.g: ...args: any[] )
	 */
	var: boolean

	/**
	 * Default value
	 */
	dv?: any
}

/**
 * Method parameter description
 */
export class Parameter
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
	 * Is parameter is variadic (e.g ...args)
	 */
	public readonly variadic: boolean;

	/**
	 * Default parameter value
	 */
	public readonly defaultValue?: any;


	/**
	 * @internal
	 * @param properties
	 */
	constructor(properties: ParameterDescription)
	{
		this._type = new LazyType(properties.t);
		this.name = properties.n;
		this.optional = properties.o;
		this.variadic = properties.var;
		this.defaultValue = properties.dv;
	}
}
