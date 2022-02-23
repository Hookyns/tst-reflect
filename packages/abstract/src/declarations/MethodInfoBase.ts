import { ParameterInfo } from "./ParameterInfo";

export abstract class MethodInfoBase
{
	private readonly _parameters: Array<ParameterInfo>;

	/**
	 * @param initializer
	 */
	protected constructor(initializer: MethodInfoBaseInitializer)
	{
		this._parameters = initializer.parameters || [];
	}

	/**
	 * Return parameters.
	 */
	getParameters(): ReadonlyArray<ParameterInfo>
	{
		return this._parameters.slice();
	}
}

export interface MethodInfoBaseInitializer
{
	parameters?: Array<ParameterInfo>;
}