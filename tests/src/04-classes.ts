import {
	AccessModifier,
	Accessor,
	getType,
	Type,
	TypeKind
}                from "tst-reflect";
import * as path from "path";

export class Something
{
	property: string = "";
	optionalProperty?: string;
	readonly readOnlyProperty: string = "";

	get getter(): string
	{
		return "";
	}

	set setter(val: string)
	{
	}


	constructor()
	constructor(property: string)
	constructor(property?: string)
	{
		if (property)
		{
			this.property = property;
		}
	}

	method(): string
	{
		return "";
	}

	optionalMethod?(): string;
}

const type = getType<Something>();
const properties = type.getProperties();
const methods = type.getMethods();

test("Type of class is correct", () => {
	expect(type instanceof Type).toBe(true);
	expect(type).not.toBe(Type.Unknown);
	expect(type.name).toBe("Something");
	expect(type.kind).toBe(TypeKind.Class);
	expect(type.isClass()).toBe(true);
	expect(type.baseType).toBe(Type.Object);
});

test("Type of class has all the members", () => {
	expect(properties).toHaveLength(5);
	expect(methods).toHaveLength(2);
});

test("Class constructors", () => {
	const ctors = type.getConstructors()!;

	expect(ctors).toBeDefined();
	expect(ctors).toHaveLength(2);
	expect(ctors[0].getParameters()).toHaveLength(0);
	expect(ctors[1].getParameters()).toHaveLength(1);
	expect(ctors[1].getParameters()[0].name).toBe("property");
});

test("Class import details", () => {
	expect(type.constructorDescription).toBeDefined();
	expect(type.constructorDescription!.exportName).toBe("Something");
	expect(type.constructorDescription!.name).toBe("Something");
	expect(path.normalize(type.constructorDescription!.sourcePath!)
		.replace("src", "dist")
		.replace(".ts", ".js")
	).toBe(path.normalize(__filename));
});

test("Regular class property", () => {
	const prop = properties.find(prop => prop.name == "property")!;

	expect(prop).not.toBeUndefined();
	expect(prop.type).toBe(Type.String);
	expect(prop.readonly).toBe(false);
	expect(prop.accessModifier).toBe(AccessModifier.Public);
	expect(prop.accessor).toBe(Accessor.None);
	expect(prop.optional).toBe(false);
	expect(prop.getDecorators()).toHaveLength(0);
});

test("Optional class property", () => {
	const prop = properties.find(prop => prop.name == "optionalProperty")!;

	expect(prop).not.toBeUndefined();
	expect(prop.type.union).toBe(true);
	expect(prop.type.types).toBeDefined();
	expect(prop.type.types).toContain(Type.String);
	expect(prop.readonly).toBe(false);
	expect(prop.accessModifier).toBe(AccessModifier.Public);
	expect(prop.accessor).toBe(Accessor.None);
	expect(prop.optional).toBe(true);
	expect(prop.getDecorators()).toHaveLength(0);
});

test("Readonly class property", () => {
	const prop = properties.find(prop => prop.name == "readOnlyProperty")!;

	expect(prop).not.toBeUndefined();
	expect(prop.type).toBe(Type.String);
	expect(prop.readonly).toBe(true);
	expect(prop.accessModifier).toBe(AccessModifier.Public);
	expect(prop.accessor).toBe(Accessor.None);
	expect(prop.optional).toBe(false);
	expect(prop.getDecorators()).toHaveLength(0);
});

test("Getter class property", () => {
	const prop = properties.find(prop => prop.name == "getter")!;

	expect(prop).not.toBeUndefined();
	expect(prop.type).toBe(Type.String);
	expect(prop.readonly).toBe(true);
	expect(prop.accessModifier).toBe(AccessModifier.Public);
	expect(prop.accessor).toBe(Accessor.Getter);
	expect(prop.optional).toBe(false);
	expect(prop.getDecorators()).toHaveLength(0);
});

test("Setter class property", () => {
	const prop = properties.find(prop => prop.name == "setter")!;

	expect(prop).not.toBeUndefined();
	expect(prop.type).toBe(Type.String);
	expect(prop.readonly).toBe(false);
	expect(prop.accessModifier).toBe(AccessModifier.Public);
	expect(prop.accessor).toBe(Accessor.Setter);
	expect(prop.optional).toBe(false);
	expect(prop.getDecorators()).toHaveLength(0);
});

test("Regular class method", () => {
	const method = methods.find(prop => prop.name == "method")!;

	expect(method).not.toBeUndefined();
	expect(method.returnType).toBe(Type.String);
	expect(method.accessModifier).toBe(AccessModifier.Public);
	expect(method.optional).toBe(false);
	expect(method.getDecorators()).toHaveLength(0);
});

test("Optional class method", () => {
	const method = methods.find(prop => prop.name == "optionalMethod")!;

	expect(method).not.toBeUndefined();
	expect(method.returnType).toBe(Type.String);
	expect(method.accessModifier).toBe(AccessModifier.Public);
	expect(method.optional).toBe(true);
	expect(method.getDecorators()).toHaveLength(0);
});