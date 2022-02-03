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
}

/**
 * Decoration description
 */
export interface Decorator
{
	/**
	 * Decorator name
	 */
	name: string;

	/**
	 * Decorator full name
	 */
	fullName?: string;
}
