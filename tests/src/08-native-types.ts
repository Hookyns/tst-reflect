import { Type } from "tst-reflect";

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