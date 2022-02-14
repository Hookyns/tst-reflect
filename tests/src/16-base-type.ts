import {
	getType,
	Type
} from "tst-reflect";

test("getType(val) called with runtime value and it is not Type.Unknown", () => {
	const type = getType({});

	expect(type).toBeDefined();
	expect(type instanceof Type).toBe(true);
	expect(type).not.toBe(Type.Unknown);
	expect(type.isObjectLiteral()).toBeTruthy();

	expect(type.baseType).toBe(Type.Object);
	expect(type.baseType!.baseType).toBe(undefined);
});