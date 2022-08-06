import {
	getType,
	Type,
	TypeKind
} from "tst-reflect";

test("getType<typeof function>() of function", () => {
	function foo<T extends string = "">(x: T, y: number)
	{
		return 1;
	}

	const fncType = getType<typeof foo>();

	expect(fncType.kind).toBe(TypeKind.Function);
	expect(fncType.name).toBe("foo");
	expect(fncType.function!.returnType).toBe(Type.Number);

	const parameters = fncType.function!.getParameters();
	expect(parameters.map(prop => prop.name)).toEqual(expect.arrayContaining(["x", "y"]));
	expect(parameters[1].type).toBe(Type.Number);

	const typeParameters = fncType.function!.getTypeParameters();
	expect(typeParameters).toHaveLength(1);
	expect(typeParameters[0].name).toBe("T");
});