import {
	getType,
	Type
} from "tst-reflect";

test("It is possible to get type of generic type parameter.", () => {
	function infer<T>(): Type
	{
		return getType<T>();
	}

	class A
	{
	}

	expect(infer<A>() instanceof Type).toBe(true);
	expect(infer<A>()).not.toBe(Type.Unknown);
});

test("Get generic type arguments from arrays.", () => {
	interface MyObject
	{
		numberArray: Array<number>;
		stringArray: ReadonlyArray<string>;
	}

	const t = getType<MyObject>();

	const aNumberArrayProp = t.getProperties().find(p => p.name === "numberArray")!;
	expect(aNumberArrayProp.type.isArray()).toBeTruthy();
	expect(aNumberArrayProp.type.getTypeArguments()).toHaveLength(1);
	expect(aNumberArrayProp.type.getTypeArguments()![0].name).toBe("Number");

	const aStringArrayProp = t.getProperties().find(p => p.name === "stringArray")!;
	expect(aStringArrayProp.type.isArray()).toBeTruthy();
	expect(aStringArrayProp.type.getTypeArguments()).toHaveLength(1);
	expect(aStringArrayProp.type.getTypeArguments()![0].name).toBe("String");
});

test("Forward generic type..", () => {
	function foo<X>()
	{
		const type = getType<X>();

		expect(type instanceof Type).toBe(true);
		expect(type).not.toBe(Type.Unknown);
		expect(type.name).toBe("A");

		bar<X>();
	}

	function bar<Y>()
	{
		const type = getType<Y>();

		expect(type instanceof Type).toBe(true);
		expect(type).not.toBe(Type.Unknown);
		expect(type.name).toBe("A");

		baz<Y>();
	}

	function baz<Z>()
	{
		const type = getType<Z>();

		expect(type instanceof Type).toBe(true);
		expect(type).not.toBe(Type.Unknown);
		expect(type.name).toBe("A");
	}

	class A
	{
	}

	foo<A>();
});