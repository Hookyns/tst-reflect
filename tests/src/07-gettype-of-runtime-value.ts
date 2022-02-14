import {
	getType,
	reflect,
	Type
} from "tst-reflect";

test("getType(val) called with runtime value and it is not Type.Unknown", () => {
	// @reflect() decorator required in some configurations
	class A
	{
		constructor(public foo: string)
		{
		}
	}
	
	const a: unknown = new A("Lipsum");

	expect(getType(a) instanceof Type).toBe(true);
	expect(getType(a)).not.toBe(Type.Unknown);
	expect(getType(a).name).toBe("A");
	expect(getType(a)).toBe(getType<A>());
});