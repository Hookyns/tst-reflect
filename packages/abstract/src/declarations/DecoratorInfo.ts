/**
 * Represents a decorator of a class, method or parameter.
 */
export class DecoratorInfo
{
	/**
	 * @internal
	 */
	private readonly _args: Array<any>;

	/**
	 * Decorator name
	 */
	readonly name: string;

	/**
	 * Decorator full name
	 */
	readonly fullName?: string;

	/**
	 * @param initializer
	 */
	constructor(initializer: DecoratorInfoInitializer)
	{
		this.name = initializer.name;
		this.fullName = initializer.fullName;
		this._args = initializer.args || [];
	}

	/**
	 * List of literal arguments
	 */
	getArguments(): Array<any>
	{
		return this._args.slice();
	}
}

export interface DecoratorInfoInitializer
{
	name: string;
	fullName?: string;
	args?: Array<any>;
}