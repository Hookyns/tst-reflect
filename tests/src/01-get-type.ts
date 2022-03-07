import {
	getType,
	Type
} from "tst-reflect";

test("getType<T>() is transformed and it is not Type.Unknown", () => {
	class A
	{
	}

	expect(getType<A>() instanceof Type).toBe(true);
	expect(getType<A>()).not.toBe(Type.Unknown);
	expect(getType<A>().name).toBe("A");
});

test("getType<T>() returns correct type", () => {
	// Array is Array
	expect(getType<string[]>().is(getType<string[]>())).toBe(true);
	expect(getType<string[]>().is(getType<number[]>())).toBe(true);
	
	expect(
		getType<Array<string>>().is(getType<string[]>())
	).toBe(true);
	
	expect(
		getType<string[]>().getTypeArguments()[0].is(getType<string[]>().getTypeArguments()[0])
	).toBe(true);
	
	expect(
		getType<string[]>().getTypeArguments()[0]
	).toBe(getType<string[]>().getTypeArguments()[0]);
	
	expect(
		getType<string[]>().getTypeArguments()[0].is(getType<number[]>().getTypeArguments()[0])
	).toBe(false);
});