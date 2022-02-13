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