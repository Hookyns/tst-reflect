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
	
	const signature = fncType.getSignatures()[0];
	
	expect(signature.returnType).toBe(Type.Number);

	const parameters = signature.getParameters();
	expect(parameters.map(prop => prop.name)).toEqual(expect.arrayContaining(["x", "y"]));
	expect(parameters[1].type).toBe(Type.Number);

	const typeParameters = signature.getTypeParameters();
	expect(typeParameters).toHaveLength(1);
	expect(typeParameters[0].name).toBe("T");
});

test("getType<typeof function>() of function - overloads", () => {
	function someFunction(alpha: boolean, beta?: string): string
	function someFunction<U, V extends string>(b?: string): number
	function someFunction(aOrB?: boolean | string, b?: string): string | number
	{
		return "";
	}

	const fncType = getType<typeof someFunction>();

	expect(fncType.kind).toBe(TypeKind.Function);
	expect(fncType.name).toBe("someFunction");
	
	const signatures = fncType.getSignatures();
	
	expect(signatures).toHaveLength(2);
	
	const signature1 = signatures[0];
	const parameters = signature1.getParameters();
	
	expect(signature1.returnType).toBe(Type.String);
	expect(parameters.map(prop => prop.name)).toEqual(expect.arrayContaining(["alpha", "beta"]));
	expect(parameters[1].type.isUnion()).toBeTruthy();
	expect(parameters[1].type.types[1]).toBe(Type.String);
	
	
	const signature2 = signatures[1];
	const typeParameters = signature2.getTypeParameters();
	const parameters2 = signature2.getParameters();
	
	expect(signature2.returnType).toBe(Type.Number);
	expect(typeParameters).toHaveLength(2);
	expect(parameters2[0].name).toBe("b");
	expect(parameters2[0].optional).toBeTruthy();
	expect(typeParameters[0].name).toBe("U");
	expect(typeParameters[1].name).toBe("V");
});