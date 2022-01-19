import {
	AccessModifier,
	Accessor,
	getType
} from "tst-reflect";


/**
 * @reflectGeneric
 */
export function printClassInfo<TType>()
{
	const type = getType<TType>();

	if (!type.isClass())
	{
		return;
	}

	const properties = type.getProperties();
	const methods = type.getMethods();

	console.log("class " + type.name);
	console.log("\tfull type identifier: " + type.fullName);

	console.log("\n\tProperties");
	console.log(
		properties.map(prop => "\t\t"
			+ (AccessModifier[prop.accessModifier].toLowerCase())
			+ " " + (Accessor[prop.accessor].toLowerCase())
			+ " " + prop.name + ": " + prop.type.name
		).join("\n")
	);

	console.log("\n\tMethods");
	console.log(
		methods.map(method => "\t\t"
			+ (AccessModifier[method.accessModifier].toLowerCase())
			+ " " + method.name
			+ "("
			+ method.getParameters().map(param => param.name + ":" + param.type.name).join(", ")
			+ "): " + method.returnType.name
			+ (method.optional ? " [optional]" : "")
		).join("\n")
	);
}