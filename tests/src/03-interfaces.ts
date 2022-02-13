import {
	AccessModifier,
	Accessor,
	getType,
	Type,
	TypeKind
} from "tst-reflect";

interface ISomething
{
	property: string;
	optionalProperty?: string;
	readonly readOnlyProperty: string;

	get getter(): string;
	set setter(val: string);

	method(): string;
	optionalMethod?(): string;
}

const type = getType<ISomething>();
const properties = type.getProperties();
const methods = type.getMethods();

test("Type of interface is correct", () => {
	expect(type instanceof Type).toBe(true);
	expect(type).not.toBe(Type.Unknown);
	expect(type.name).toBe("ISomething");
	expect(type.kind).toBe(TypeKind.Interface);
	expect(type.isInterface()).toBe(true);
	expect(type.baseType).toBe(Type.Object);
});

test("Type of interface has all the members", () => {
	expect(properties).toHaveLength(5);
	expect(methods).toHaveLength(2);
});

test("Regular interface property", () => {
	const prop = properties.find(prop => prop.name == "property")!;
	
	expect(prop).not.toBeUndefined();
	expect(prop.type).toBe(Type.String);
	expect(prop.readonly).toBe(false);
	expect(prop.accessModifier).toBe(AccessModifier.Public);
	expect(prop.accessor).toBe(Accessor.None);
	expect(prop.optional).toBe(false);
	expect(prop.getDecorators()).toHaveLength(0);
});

test("Optional interface property", () => {
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

test("Readonly interface property", () => {
	const prop = properties.find(prop => prop.name == "readOnlyProperty")!;
	
	expect(prop).not.toBeUndefined();
	expect(prop.type).toBe(Type.String);
	expect(prop.readonly).toBe(true);
	expect(prop.accessModifier).toBe(AccessModifier.Public);
	expect(prop.accessor).toBe(Accessor.None);
	expect(prop.optional).toBe(false);
	expect(prop.getDecorators()).toHaveLength(0);
});

test("Getter interface property", () => {
	const prop = properties.find(prop => prop.name == "getter")!;
	
	expect(prop).not.toBeUndefined();
	expect(prop.type).toBe(Type.String);
	expect(prop.readonly).toBe(true);
	expect(prop.accessModifier).toBe(AccessModifier.Public);
	expect(prop.accessor).toBe(Accessor.Getter);
	expect(prop.optional).toBe(false);
	expect(prop.getDecorators()).toHaveLength(0);
});

test("Setter interface property", () => {
	const prop = properties.find(prop => prop.name == "setter")!;
	
	expect(prop).not.toBeUndefined();
	expect(prop.type).toBe(Type.String);
	expect(prop.readonly).toBe(false);
	expect(prop.accessModifier).toBe(AccessModifier.Public);
	expect(prop.accessor).toBe(Accessor.Setter);
	expect(prop.optional).toBe(false);
	expect(prop.getDecorators()).toHaveLength(0);
});

test("Regular interface method", () => {
	const method = methods.find(prop => prop.name == "method")!;
	
	expect(method).not.toBeUndefined();
	expect(method.returnType).toBe(Type.String);
	expect(method.accessModifier).toBe(AccessModifier.Public);
	expect(method.optional).toBe(false);
	expect(method.getDecorators()).toHaveLength(0);
});

test("Optional interface method", () => {
	const method = methods.find(prop => prop.name == "optionalMethod")!;
	
	expect(method).not.toBeUndefined();
	expect(method.returnType).toBe(Type.String);
	expect(method.accessModifier).toBe(AccessModifier.Public);
	expect(method.optional).toBe(true);
	expect(method.getDecorators()).toHaveLength(0);
});