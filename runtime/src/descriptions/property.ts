import { AccessModifier, Accessor }        from "../flags";
import { Type }                  from "../reflect";
import { Decorator, DecoratorDescription } from "./decorator";

/**
 * @internal
 */
export interface PropertyDescription {
	/**
	 * Name of the property
	 */
	n: string;

	/**
	 * Property type
	 */
	t: Type;

	/**
	 * Optional property
	 */
	o: boolean;

	/**
	 * Decorators
	 */
	d?: Array<DecoratorDescription>;

	/**
	 * Access modifier
	 */
	am?: AccessModifier;

	/**
	 * Accessor
	 */
	acs?: Accessor;

	/**
	 * Readonly
	 */
	ro?: boolean;
}

/**
 * Property description
 */
export interface Property
{
	/**
	 * Property name
	 */
	name: string;

	/**
	 * Property type
	 */
	type: Type;

	/**
	 * Optional property
	 */
	optional: boolean;

	/**
	 * Property decorators
	 */
	decorators: ReadonlyArray<Decorator>;

	/**
	 * Access modifier
	 */
	accessModifier: AccessModifier;

	/**
	 * Accessor
	 */
	accessor: Accessor;

	/**
	 * Readonly
	 */
	readonly: boolean;
}
