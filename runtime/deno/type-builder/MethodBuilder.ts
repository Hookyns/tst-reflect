import {
	MethodInfo,
	MethodInfoActivator,
	MethodDescription
} from "../descriptions/methodInfo.ts";

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
	build(): MethodInfo
	{
		return Reflect.construct(MethodInfo, [this.description], MethodInfoActivator);
	}
}