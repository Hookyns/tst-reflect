import {
	AccessModifier,
	Accessor,
	Constructor,
	Method,
	Property
} from "tst-reflect";

export function formatProperty(prop: Property): string
{
	return "\t\t" + `${prop.optional ? "[optional]" : ""}
		 ${AccessModifier[prop.accessModifier].toLowerCase()}
		 ${prop.accessor != Accessor.None ? Accessor[prop.accessor].toLowerCase() : ""} 
		 ${prop.name}: ${prop.type.name}`.replace(/[\r\n\t]/g, "");
}

export function formatMethod(method: Method): string
{
	const params = method.getParameters().map(param => `${param.name}: ${param.type.name}`);
	return "\t\t" + `${method.optional ? "[optional] " : ""}
		 ${AccessModifier[method.accessModifier].toLowerCase()}
		 ${method.name}(${params}): ${method.returnType.name}`.replace(/[\r\n\t]/g, "");
}

export function formatConstructor(method: Constructor): string
{
	const params = method.getParameters().map(param => `${param.name}: ${param.type.name}`);
	return "\t\t" + `constructor(${params})`;
}