import {
	Property,
	PropertyActivator,
	PropertyDescription
} from "../descriptions/property";

export class PropertyBuilder
{
	/**
	 * @internal
	 */
	constructor(private description: PropertyDescription)
	{
	}

	/**
	 * Build Property info
	 */
	build(): Property
	{
		return Reflect.construct(Property, [this.description], PropertyActivator);
	}
}