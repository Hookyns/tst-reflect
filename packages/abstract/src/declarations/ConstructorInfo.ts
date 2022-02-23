import {
	MethodInfoBase,
	MethodInfoBaseInitializer
} from "./MethodInfoBase";

/**
 * Represents a constructor of a class type.
 */
export class ConstructorInfo extends MethodInfoBase
{
	/**
	 * @param initializer
	 */
	constructor(initializer: ConstructorInfoInitializer)
	{
		super(initializer);
	}
}

export interface ConstructorInfoInitializer extends MethodInfoBaseInitializer
{
}