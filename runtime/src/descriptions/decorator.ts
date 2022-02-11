/**
 * @internal
 */
export interface DecoratorDescription
{
	/**
	 * Decorator name
	 */
	n: string;

	/**
	 * Decorator full name
	 */
	fn: string;

	/**
	 * List of literal arguments
	 */
	args?: Array<any>;
}

/**
 * Decoration description
 */
export class Decorator
{
	/**
	 * Decorator name
	 */
	name: string;

	/**
	 * Decorator full name
	 */
	fullName?: string;

	/**
	 * @internal
	 */
	private args: Array<any>;

	/**
	 * Internal constructor
	 * @internal
	 */
	protected constructor(description: DecoratorDescription)
	{
		this.name = description.n;
		this.fullName = description.fn;
		this.args = description.args || [];
	}

	/**
	 * List of literal arguments
	 */
	getArguments(): Array<any>
	{
		return this.args.slice();
	}
}

/**
 * @internal
 */
export class DecoratorActivator extends Decorator {}
