import {
	getType,
	Type
} from "tst-reflect";

test("It is possible to get type of generic argument, no function/method parameters.", () => {
	function foo<T extends string|number>(): string | number
	{
		expect(arguments.length).toBe(0);
		return getType<T>().literalValue;
	}
	
	class A
	{
		foo<T extends string|number>(): string | number
		{
			expect(arguments.length).toBe(0);
			return getType<T>().literalValue;
		}
	}

	expect(foo<"lorem">()).toBe("lorem");
	expect(foo<5>()).toBe(5);
	expect(foo.length).toBe(0);
	
	const a = new A();
	expect(a.foo<"ipsum">()).toBe("ipsum");
	expect(a.foo<5>()).toBe(5);
	expect(A.prototype.foo.length).toBe(0);
});

test("It is possible to get type of generic type parameter inferred from argument; simple single parameter", () => {
	function foo<T extends string|number>(v: T): string | number
	{
		expect(arguments.length).toBe(1);
		return getType<T>().literalValue;
	}
	
	class A
	{
		foo<T extends string|number>(v: T): string | number
		{
			expect(arguments.length).toBe(1);
			return getType<T>().literalValue;
		}
	}

	expect(foo("lorem")).toBe("lorem");
	expect(foo(5)).toBe(5);
	expect(foo.length).toBe(1);
	
	const a = new A();
	expect(a.foo("ipsum")).toBe("ipsum");
	expect(a.foo(5)).toBe(5);
	expect(A.prototype.foo.length).toBe(1);
});

test("It is possible to get type of generic type parameter inferred from argument; rest parameter", () => {
	function foo<T extends string|number>(...v: T[]): string | number
	{
		expect(arguments.length).toBe(1);
		expect(v.length).toBe(1);
		return getType<T>().literalValue;
	}
	
	class A
	{
		foo<T extends string|number>(...v: T[]): string | number
		{
			expect(arguments.length).toBe(1);
			expect(v.length).toBe(1);
			return getType<T>().literalValue;
		}
	}

	expect(foo("lorem")).toBe("lorem");
	expect(foo(5)).toBe(5);
	expect(foo.length).toBe(0);
	
	const a = new A();
	expect(a.foo("ipsum")).toBe("ipsum");
	expect(a.foo(5)).toBe(5);
	expect(A.prototype.foo.length).toBe(0);
});

test("It is possible to get type of generic type parameter inferred from array argument; array parameter", () => {
	function foo<T extends string|number>(v: T[]): string | number
	{
		expect(arguments.length).toBe(1);
		expect(v.length).toBe(1);
		return getType<T>().literalValue;
	}
	
	class A
	{
		foo<T extends string|number>(v: T[]): string | number
		{
			expect(arguments.length).toBe(1);
			expect(v.length).toBe(1);
			return getType<T>().literalValue;
		}
	}

	expect(foo(["lorem"])).toBe("lorem");
	expect(foo([5])).toBe(5);
	expect(foo.length).toBe(1);
	
	const a = new A();
	expect(a.foo(["ipsum"])).toBe("ipsum");
	expect(a.foo([5])).toBe(5);
	expect(A.prototype.foo.length).toBe(1);
});

test("Union of inferred types", () => {
	function foo<T extends string|number>(v: T[]): Type
	{
		expect(arguments.length).toBe(1);
		expect(v.length).toBe(2);
		return getType<T>();
	}
	
	class A
	{
		foo<T extends string|number>(v: T[]): Type
		{
			expect(arguments.length).toBe(1);
			expect(v.length).toBe(2);
			return getType<T>();
		}
	}

	const funcType = foo(["lorem", 5]);
	expect(funcType.isUnion()).toBeTruthy();
	expect(funcType.types[0].literalValue).toBe("lorem");
	expect(funcType.types[1].literalValue).toBe(5);
	expect(foo.length).toBe(1);
	
	const a = new A();
	const methodType = a.foo(["lorem", 5])
	expect(methodType.isUnion()).toBeTruthy();
	expect(methodType.types[0].literalValue).toBe("lorem");
	expect(methodType.types[1].literalValue).toBe(5);
	expect(A.prototype.foo.length).toBe(1);
});

test("Multiple parameters", () => {

	function getTypes<T extends string | number, U>(t: T[], u: U, v: boolean): [Type, Type, Type]
	{
		return [getType<T>(), getType<U>(), getType(v)];
	}

	class A
	{
	}

	const a = new A();

	const [loremType, fooType, trueType] = getTypes<string, any>(["lorem", "ipsum"], { foo: "bar" }, true);
	
	expect(loremType).toBe(Type.String);
	expect(fooType).toBe(Type.Any);
	expect(trueType).toBe(Type.Boolean);
	
	
	const [loremType2, aType, falseType] = getTypes(["lorem", "ipsum"], a, false);
	
	expect(loremType2.isUnion()).toBeTruthy();
	expect(aType).toBe(getType<A>());
	expect(falseType).toBe(Type.Boolean);
});