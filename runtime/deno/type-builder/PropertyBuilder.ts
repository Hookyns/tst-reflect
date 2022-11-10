import {
	PropertyInfo,
	PropertyInfoActivator,
	PropertyDescription
} from "../descriptions/propertyInfo.ts";

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
	build(): PropertyInfo
	{
		return Reflect.construct(PropertyInfo, [this.description], PropertyInfoActivator);
	}
}