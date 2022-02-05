import {
	getType,
	Type
} from "tst-reflect";

function isAssignable(propertyType: Type, value: any): boolean
{
	if (propertyType.isUnionOrIntersection())
	{
		if (propertyType.intersection)
		{
			return propertyType.types.every(type => isAssignable(type, value));
		}
		else
		{
			return propertyType.types.some(type => isAssignable(type, value));
		}
	}

	if (!propertyType.isNative())
	{
		return value.constructor == propertyType.ctor;
	}

	switch (propertyType.name.toLowerCase())
	{
		case "string":
			return typeof value == "string";
		case "number":
			return typeof value == "number";
		case "boolean":
			return typeof value == "boolean";
		case "any":
		case "unknown":
			return true;
		case "void":
			return value === undefined;
	}

	if (propertyType.isArray())
	{
		if (value?.constructor == Array)
		{
			const arrayType = propertyType.getTypeArguments()[0];
			return value.every(val => isAssignable(arrayType, val));
		}

		return false;
	}

	console.log("assignable check probably not implemented for value", value, "and property type", propertyType.name, "kind", propertyType.kind);

	return false;
}

/**
 * @reflectGeneric
 * @param value
 */
export function isValid<TType>(value: any): value is TType
{
	const target = getType<TType>();

	if (target.isClass())
	{
		return value instanceof target.ctor;
	}

	const currentMembers = Object.keys(value);
	const currentPropertyNames = currentMembers.filter(member => typeof value[member] != "function");
	const currentMethodNames = currentMembers.filter(member => typeof value[member] == "function");

	const targetMembers = target.flattenInheritedMembers();
	const targetProperties = Object.values(targetMembers.properties);
	const targetMethods = Object.values(targetMembers.methods);

	return targetProperties.every(targetProperty =>
			currentPropertyNames.some(currentPropertyName =>
					targetProperty.optional || (
						currentPropertyName == targetProperty.name && isAssignable(targetProperty.type, value[currentPropertyName])
					)
			)
		)
		&& targetMethods.every(targetMethod =>
			currentMethodNames.some(currentMethodName => targetMethod.optional || currentMethodName == targetMethod.name)
		);
}