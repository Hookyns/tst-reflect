import { getType } from "tst-reflect";

class Dependency1
{
}

class Dependency2
{
}

class Service
{
	constructor(private dependency1: Dependency1, private dependency2: Dependency2)
	{
	}
}

class FooService
{
	constructor(private foo: number, private bar: string = 'hello', ...args: any[])
	{
	}
}

test("getConstructors() params type", async () => {
	const type = getType<Service>();
	const ctors = type.getConstructors();
	
	expect(ctors).toBeDefined();
	expect(ctors).toHaveLength(1);
	
	const params = ctors![0].getParameters();
	expect(params).toBeDefined();
	expect(params).toHaveLength(2);
	
	expect(params[0].type).toBe(getType<Dependency1>());
	expect(params[1].type).toBe(getType<Dependency2>());

	const d1Ctor = await params[0].type.getCtor();
	const d2Ctor = await params[1].type.getCtor();
	
	expect(d1Ctor).toBe(Dependency1);
	expect(d2Ctor).toBe(Dependency2);
});

test("getConstructors() variadic and default value", async () => {
	const type = getType<FooService>();
	const ctors = type.getConstructors();

	expect(ctors).toBeDefined();
	expect(ctors).toHaveLength(1);

	const params = ctors![0].getParameters();
	expect(params).toBeDefined();
	expect(params).toHaveLength(3);

	expect(params[0].defaultValue).toBe(undefined);
	expect(params[0].variadic).toBe(false);

	expect(params[1].defaultValue).toBe('hello');
	expect(params[1].variadic).toBe(false);

	expect(params[2].defaultValue).toBe(undefined);
	expect(params[2].variadic).toBe(true);
});