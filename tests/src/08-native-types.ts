import {
	getType,
	Type
} from "tst-reflect";

test("All native types are correct", () => {
	expect(Type.Unknown.name).toBe("unknown");
	expect(Type.Object.name).toBe("Object");
	expect(Type.Undefined.name).toBe("undefined");
	expect(Type.Null.name).toBe("null");
	expect(Type.Void.name).toBe("void");
	expect(Type.Number.name).toBe("Number");
	expect(Type.String.name).toBe("String");
	expect(Type.Boolean.name).toBe("Boolean");
	expect(Type.Date.name).toBe("Date");
});

test("Type of number is Type.Number", () => {
	expect(getType(5)).toBe(Type.Number);
	expect(getType<5>().isLiteral()).toBeTruthy();
});

test("Type of string is Type.String", () => {
	expect(getType("foo")).toBe(Type.String);
	expect(getType<"foo">().isLiteral()).toBeTruthy();
});

test("Type of boolean is Type.Boolean", () => {
	expect(getType<boolean>()).toBe(Type.Boolean);
	expect(getType(true)).toBe(Type.Boolean);
	expect(getType(false)).toBe(Type.Boolean);
});

test("Type of undefined is Type.Undefined", () => {
	expect(getType(undefined)).toBe(Type.Undefined);
	expect(getType<undefined>()).toBe(Type.Undefined);
});

test("Type of null is Type.Null", () => {
	expect(getType(null)).toBe(Type.Null);
	expect(getType<null>()).toBe(Type.Null);
});

test("Type of unknown is Type.Unknown", () => {
	expect(getType<unknown>()).toBe(Type.Unknown);
});

test("Type of true is true literal", () => {
	expect(getType<true>().isTrue()).toBeTruthy();
});

test("Type of false is false literal", () => {
	expect(getType<false>().isFalse()).toBeTruthy();
});

test("Type of Date is Type.Date", () => {
	expect(getType(new Date())).toBe(Type.Date);
});

test("Base type of object literal is Type.Object", () => {
	expect(getType({}).baseType).toBe(Type.Object);
});