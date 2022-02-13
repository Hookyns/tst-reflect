import {
	getType,
	Type
} from "tst-reflect";

test("getType<T>() is transformed and it is not Type.Unknown", () => {
	enum Foo
	{
		One,
		Two
	}

	const type = getType<Foo>();

	expect(type instanceof Type).toBe(true);
	expect(type).not.toBe(Type.Unknown);
	expect(type.name).toBe("Foo");
	expect(type.isEnum()).toBe(true);
	expect(type.getEnum()!.getValues()).toEqual([0, 1]);
	expect(type.getEnum()!.getEnumerators()).toEqual(["One", "Two"]);
	expect(type.getEnum()!.getEntries()).toEqual([["One", 0], ["Two", 1]]);
});