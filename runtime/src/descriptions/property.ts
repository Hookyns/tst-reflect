import {
	AccessModifier,
	Accessor
}                          from "../enums";
import {
	Mapper,
	resolveLazyType
} from "../mapper";
import type { Type }       from "../Type";
import {
	Decorator,
	DecoratorDescription
}                          from "./decorator";

/**
 * @internal
 */
export interface PropertyDescription
{
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
export class Property
{
	/**
	 * Property decorators
	 * @internal
	 */
	private _decorators: ReadonlyArray<Decorator>;
	
	/**
	 * Property name
	 */
	readonly name: string;

	/**
	 * Property type
	 */
	readonly type: Type;

	/**
	 * Optional property
	 */
	readonly optional: boolean;

	/**
	 * Access modifier
	 */
	readonly accessModifier: AccessModifier;

	/**
	 * Accessor
	 */
	readonly accessor: Accessor;

	/**
	 * Readonly
	 */
	readonly readonly: boolean;

	/**
	 * @param description
	 * @internal
	 */
	protected constructor(description: PropertyDescription)
	{
		this.name = description.n;
		this.type = resolveLazyType(description.t);
		this._decorators = description.d?.map(Mapper.mapDecorators) || [];
		this.optional = description.o;
		this.accessModifier = description.am ?? AccessModifier.Public;
		this.accessor = description.acs ?? Accessor.None;
		this.readonly = description.ro ?? false;
	}
	
	/**
	 * Returns array of decorators
	 */
	getDecorators(): ReadonlyArray<Decorator>
	{
		return this._decorators.slice();
	}
}

/**
 * @internal
 */
export class PropertyActivator extends Property
{
}