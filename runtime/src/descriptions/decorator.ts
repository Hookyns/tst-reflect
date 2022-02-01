/**
 * @internal
 */
export interface DecoratorDescription {
	n: string;
	fn: string;
}

/**
 * Decoration description
 */
export interface Decorator {
	/**
	 * Decorator name
	 */
	name: string;

	/**
	 * Decorator full name
	 */
	fullName?: string;
}
