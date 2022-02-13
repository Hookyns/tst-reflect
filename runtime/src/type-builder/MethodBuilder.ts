import {
	Method,
	MethodActivator,
	MethodDescription
} from "../descriptions/method";

export class MethodBuilder
{
	/**
	 * @internal
	 */
	constructor(private description: MethodDescription)
	{
	}

	/**
	 * Build Method info
	 */
	build(): Method
	{
		return Reflect.construct(Method, [this.description], MethodActivator);
	}
}