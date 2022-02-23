import {
	MethodInfo,
	ParameterInfo,
	PropertyInfo
}                      from "../declarations";
import { TypeBuilder } from "../builders";
import { Type }        from "../Type";

function concatParameters(methods: Array<MethodInfo>): ParameterInfo[][]
{
	const resultParameters: ParameterInfo[][] = [];

	for (const method of methods)
	{
		let parameterIndex = 0;

		for (const parameter of method.getParameters())
		{
			let parameters = resultParameters[parameterIndex];

			if (!parameters)
			{
				resultParameters[parameterIndex] = parameters = [];
			}

			parameters.push(parameter);
			parameterIndex++;
		}
	}

	return resultParameters;
}

export function flatten(typeToFlatten: Type): {
	properties: { [propertyName: string]: PropertyInfo },
	methods: { [methodName: string]: MethodInfo }
}
{
	const interfaceMembers = typeToFlatten.interface?.flattenInheritedMembers() ?? { properties: {}, methods: {} };
	const baseTypeMembers = typeToFlatten.baseType?.flattenInheritedMembers() ?? { properties: {}, methods: {} };

	const properties = Object.assign(interfaceMembers.properties, baseTypeMembers.properties);
	const methods = Object.assign(interfaceMembers.methods, baseTypeMembers.methods);

	if (typeToFlatten.isUnionOrIntersection())
	{
		// Map of properties/methods through united types
		const propertyUnitedMap = new Map<string, Array<PropertyInfo>>();
		const methodUnitedMap = new Map<string, Array<MethodInfo>>();

		const types = typeToFlatten.getTypes();

		for (const type of types)
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

		if (typeToFlatten.isUnion())
		{
			const typesCount = types.length;

			// Process Properties
			for (let [propertyName, unitedProperties] of propertyUnitedMap)
			{
				// UNION check; only properties which are defined inside all the united types
				if (unitedProperties.length === typesCount)
				{
					properties[propertyName] = new PropertyInfo({
						name: propertyName,
						type: TypeBuilder.createUnion(unitedProperties.map(prop => prop.type)).build().id,
						optional: unitedProperties.some(prop => prop.optional),
						readonly: unitedProperties.some(prop => prop.readonly)
					});
				}
			}

			// Process Methods
			for (let [methodName, unitedMethods] of methodUnitedMap)
			{
				// UNION check; only methods which are defined inside all the united types
				if (unitedMethods.length === typesCount)
				{
					const concatenatedParameters = concatParameters(unitedMethods);

					methods[methodName] = new MethodInfo({
						name: methodName,
						returnType: TypeBuilder.createUnion(unitedMethods.map(prop => prop.returnType)).build().id,
						optional: unitedMethods.some(meth => meth.optional),
						parameters: concatenatedParameters.map((params, i) => new ParameterInfo({
							name: "p" + i,
							type: TypeBuilder.createUnion(params.map(param => param.type)).build().id,
							optional: params.every(param => param.optional)
						}))
					});
				}
			}
		}
		else if (typeToFlatten.isIntersection())
		{
			// Process Properties
			for (let [propertyName, intersectionedProperties] of propertyUnitedMap)
			{
				properties[propertyName] = new PropertyInfo({
					name: propertyName,
					type: TypeBuilder.createIntersection(intersectionedProperties.map(prop => prop.type)).build().id,
					optional: intersectionedProperties.every(prop => prop.optional),
					readonly: intersectionedProperties.some(prop => prop.readonly)
				});
			}

			// Process Methods
			for (let [methodName, unitedMethods] of methodUnitedMap)
			{
				const concatenatedParameters = concatParameters(unitedMethods);

				methods[methodName] = new MethodInfo({
					name: methodName,
					returnType: TypeBuilder.createIntersection(unitedMethods.map(prop => prop.returnType)).build().id,
					optional: unitedMethods.every(meth => meth.optional),
					parameters: concatenatedParameters.map((params, i) => new ParameterInfo({
						name: "p" + i,
						type: TypeBuilder.createIntersection(params.map(param => param.type)).build().id,
						optional: params.some(param => param.optional)
					}))
				});
			}
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