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
});

test("Type of string is Type.String", () => {
	expect(getType("foo")).toBe(Type.String);
});

test("Type of boolean is Type.Boolean", () => {
	expect(getType(true)).toBe(Type.Boolean);
});

test("Type of undefined is Type.Undefined", () => {
	expect(getType(undefined)).toBe(Type.Undefined);
});

test("Type of null is Type.Null", () => {
	expect(getType(null)).toBe(Type.Null);
});

test("Type of Date is Type.Date", () => {
	expect(getType(new Date())).toBe(Type.Date);
});

test("Base type of object literal is Type.Object", () => {
	expect(getType({}).baseType).toBe(Type.Object);
});