import {
	getType,
	Type
}                       from "tst-reflect";
import { SomeClassBar } from "./types/SomeClassBar";
import { SomeClassBaz } from "./types/SomeClassBaz";
import { SomeClassFoo } from "./types/SomeClassFoo";

test("getType<T>() is transformed and it is not Type.Unknown", () => {
	class A
	{
	}

	expect(getType<A>() instanceof Type).toBe(true);
	expect(getType<A>()).not.toBe(Type.Unknown);
	expect(getType<A>().name).toBe("A");
});

test("getType<T>() returns correct type", () => {
	// Same array types should be equal
	expect(getType<string[]>().is(getType<string[]>())).toBe(true);

	// and different shouldn't.
	expect(getType<string[]>().is(getType<number[]>())).toBe(false);

	// Both Array<T> and T[] are equals.
	expect(
		getType<Array<string>>().is(getType<string[]>())
	).toBe(true);

	const stringArrayType = getType<string[]>();
	const numberArrayType = getType<number[]>();

	expect(stringArrayType.genericTypeDefinition).toBe(numberArrayType.genericTypeDefinition);

	expect(stringArrayType.isGenericType()).toBe(true);

	expect(stringArrayType.getTypeArguments()[0].is(getType<string[]>().getTypeArguments()[0])).toBe(true);
	expect(getType<string[]>().getTypeArguments()[0]).toBe(getType<string[]>().getTypeArguments()[0]);
	expect(stringArrayType.getTypeArguments()[0].is(numberArrayType.getTypeArguments()[0])).toBe(false);

	class Bar<T>
	{
	}

	class Foo
	{
		bar!: Bar<string>;
	}

	const barType = getType<Foo>().getProperties().find(prop => prop.name === "bar")!.type;

	expect(
		barType.getTypeArguments()[0].is(getType<string>())
	).toBe(true);

	const someClassRef = Foo;
	expect(getType(someClassRef).name).toBe("Foo");
});

test("getType<T>().fullName - uniqueness of generic types", () => {

	type TypeA<T, U> = T | U | {
		a: T;
		b: U;
	}

	interface InterfaceA<T>
	{
		a: T;
	}

	class ClassA<T, U>
	{
		a?: T;

		foo(): U
		{
			return null as unknown as U;
		}
	}

	expect(getType<InterfaceA<string>>().fullName).not.toBe(getType<InterfaceA<boolean>>().fullName);
	expect(getType<ClassA<string, boolean>>().fullName).not.toBe(getType<ClassA<boolean, string>>().fullName);

	// TODO: Solve the next line. It does not work right now.
	// expect(getType<TypeA<string, boolean>>().fullName).not.toBe(getType<TypeA<boolean, string>>().fullName);
});

test("getType<T>().fullName - uniqueness of type aliases", () => {
	class ClassA
	{
	}

	type ClassAAlias = ClassA;

	expect(getType<ClassAAlias>().fullName).toBe(getType<ClassA>().fullName);
});

test("getType<T>().fullName - uniqueness of references", () => {
	const barsFoo = getType<SomeClassBar>().getProperties().find(prop => prop.name == "foo")!.type;
	const bazsFoo = getType<SomeClassBaz>().getProperties().find(prop => prop.name == "foo")!.type;
	
	expect(barsFoo.is(bazsFoo)).toBeTruthy();
});