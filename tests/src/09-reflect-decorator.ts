import {
	reflect,
	Type
} from "tst-reflect";

@reflect()
class A
{
}

/**
 * @reflect
 */
function foo()
{
	return function(_: any) {}
}

@foo()
class B
{
}

test("@reflect decorator force type to appear in metadata", () => {
	expect(Type.getTypes()).toHaveLength(2);
	expect(Type.getTypes()[0].name).toBe("A");
});

test("Custom tagged decorator force type to appear in metadata", () => {
	expect(Type.getTypes()).toHaveLength(2);
	expect(Type.getTypes()[1].name).toBe("B");
});