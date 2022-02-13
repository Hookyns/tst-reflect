import {
	getType,
	reflect,
	Type
} from "tst-reflect";

test("getType(val) called with runtime value and it is not Type.Unknown", () => {
	@reflect()
	class A
	{
	}
	
	const a: unknown = new A();

	expect(getType(a) instanceof Type).toBe(true);
	expect(getType(a)).not.toBe(Type.Unknown);
	expect(getType(a).name).toBe("A");
});