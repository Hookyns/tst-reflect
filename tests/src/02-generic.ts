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