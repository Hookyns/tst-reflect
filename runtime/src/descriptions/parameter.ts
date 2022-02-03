import { Type } from "../reflect";

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
	t: Type;

	/**
	 * Optional parameter
	 */
	o: boolean;
}

/**
 * Method parameter description
 */
export interface MethodParameter
{
	/**
	 * Parameter name
	 */
	name: string;

	/**
	 * Parameter type
	 */
	type: Type;

	/**
	 * Parameter is optional
	 */
	optional: boolean;
}
