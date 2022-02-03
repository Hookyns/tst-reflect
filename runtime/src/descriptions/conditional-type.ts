import { Type } from "../reflect";

/**
 * @internal
 */
export interface ConditionalTypeDescription
{
	/**
	 * Extends type
	 */
	e: Type;

	/**
	 * True type
	 */
	tt: Type;

	/**
	 * False type
	 */
	ft: Type;
}

export interface ConditionalType
{
	/**
	 * Extends type
	 */
	extends: Type;

	/**
	 * True type
	 */
	trueType: Type;

	/**
	 * False type
	 */
	falseType: Type;
}
