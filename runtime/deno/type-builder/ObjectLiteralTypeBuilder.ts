import { PropertyDescription } from "../descriptions/propertyInfo.ts";
import {
	Accessor,
	TypeKind
} from "../enums.ts";
import { getTypeOfRuntimeValue } from "../reflect.ts";
import { Type } from "../Type.ts";
import { TypeBuilderBase } from "./TypeBuilderBase.ts";

export class ObjectLiteralTypeBuilder extends TypeBuilderBase
{
	private properties: Array<PropertyDescription> = [];
	
	constructor()
	{
		super();
		this.setName("Object");
	}

	/**
	 *
	 * @param object
	 */
	static fromObject(object: any): Type
	{
		if (!object)
		{
			return Type.Undefined;
		}
		if (object.constructor !== Object)
		{
			return Type.Unknown;
		}

		const builder = new ObjectLiteralTypeBuilder();
		builder.setName(object.constructor.name || "Object");
		const descriptors = Object.getOwnPropertyDescriptors(object);

		for (let prop in descriptors)
		{
			if (descriptors.hasOwnProperty(prop))
			{
				const desc = descriptors[prop];
				const type = getTypeOfRuntimeValue(object[prop]);

				if (desc.get)
				{
					builder.addProperty({
						n: prop,
						t: type,
						o: false,
						acs: Accessor.Getter,
						ro: true
					});
				}
				if (desc.set)
				{
					builder.addProperty({
						n: prop,
						t: type,
						o: false,
						acs: Accessor.Setter,
						ro: false
					});
				}
				else if (!desc.get && !desc.set)
				{
					builder.addProperty({
						n: prop,
						t: type,
						o: false,
						ro: !desc.writable
					});
				}
			}
		}

		return builder.build();
	}

	/**
	 * Add property
	 * @param description
	 */
	addProperty(description: PropertyDescription)
	{
		this.properties.push(description);
		return this;
	}

	/**
	 * Build Object Literal Type.
	 */
	build(): Type
	{
		return Type.store.wrap({
			k: TypeKind.Object,
			n: this.typeName,
			fn: this.fullName,
			props: this.properties
		});
	}
}