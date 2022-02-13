import { Method }           from "./descriptions/method";
import { Property }         from "./descriptions/property";
import type { Type }        from "./Type";
import type { TypeBuilder } from "./type-builder/TypeBuilder";

let _TypeBuilder: typeof TypeBuilder = {} as any;

export function setTypeBuilder(typeBuilder: typeof TypeBuilder)
{
	_TypeBuilder = typeBuilder;
}

export function flatten(typeToFlatten: Type): {
	properties: { [propertyName: string]: Property },
	methods: { [methodName: string]: Method }
}
{
	const interfaceMembers = typeToFlatten.interface?.flattenInheritedMembers() ?? { properties: {}, methods: {} };
	const baseTypeMembers = typeToFlatten.baseType?.flattenInheritedMembers() ?? { properties: {}, methods: {} };

	const properties = Object.assign(interfaceMembers.properties, baseTypeMembers.properties);
	const methods = Object.assign(interfaceMembers.methods, baseTypeMembers.methods);

	if (typeToFlatten.isUnionOrIntersection())
	{
		// Map of properties/methods through united types
		const propertyUnitedMap = new Map<string, Array<Property>>();
		const methodUnitedMap = new Map<string, Array<Method>>();

		for (const type of typeToFlatten.types)
		{
			for (let property of type.getProperties())
			{
				let array = propertyUnitedMap.get(property.name);

				if (!array)
				{
					propertyUnitedMap.set(property.name, array = []);
				}

				array.push(property);
			}

			for (let method of type.getMethods())
			{
				let array = methodUnitedMap.get(method.name);

				if (!array)
				{
					methodUnitedMap.set(method.name, array = []);
				}

				array.push(method);
			}
		}

		if (typeToFlatten.union)
		{
			const typesCount = typeToFlatten.types.length;

			// Process Properties
			for (let [propertyName, unitedProperties] of propertyUnitedMap)
			{
				// Only properties present in all the types are in result type
				if (unitedProperties.length == typesCount)
				{
					properties[propertyName] = _TypeBuilder
						.createProperty({
							n: propertyName,
							t: _TypeBuilder.createUnion(unitedProperties.map(prop => prop.type)).build(),
							o: unitedProperties.every(prop => prop.optional),
							ro: unitedProperties.some(prop => prop.readonly)
						})
						.build();
				}
			}

			// TODO: Process Methods
		}
		else if (typeToFlatten.intersection)
		{
			// Process Properties
			for (let [propertyName, intersectionedProperties] of propertyUnitedMap)
			{
				properties[propertyName] = _TypeBuilder
					.createProperty({
						n: propertyName,
						t: _TypeBuilder.createIntersection(intersectionedProperties.map(prop => prop.type)).build(),
						o: intersectionedProperties.every(prop => prop.optional),
						ro: intersectionedProperties.some(prop => prop.readonly)
					})
					.build();
			}

			// TODO: Process Methods
		}
	}

	for (let property of typeToFlatten.getProperties())
	{
		properties[property.name] = property;
	}

	for (let method of typeToFlatten.getMethods())
	{
		methods[method.name] = method;
	}

	return {
		properties,
		methods
	};
}