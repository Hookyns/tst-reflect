import {
	reflect,
	Type
} from "tst-reflect";

test("@reflect decorator force type to appear in metadata", () => {
	@reflect()
	class A
	{
	}

	expect(Type.getTypes()).toHaveLength(1);
	expect(Type.getTypes()[0].name).toBe("A");
});