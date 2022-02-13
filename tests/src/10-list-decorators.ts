import { getType } from "tst-reflect";

const ReflectedInfoFromMethodDecorator: Array<{
	typeName: string,
	num: number,
	bool: boolean,
	str: string
}> = [];

function classDecorator(_: any)
{
}

function propertyDecorator(_: any, __: any)
{
}

/**
 * @reflect
 */
function methodDecorator<TType>(num: number, bool: boolean, str: string)
{
	const type = getType<TType>();

	return function (target: TType, _: any)
	{
		ReflectedInfoFromMethodDecorator.push({
			typeName: type.fullName,
			num,
			bool,
			str
		});
	};
}

@classDecorator
class Something
{
	@propertyDecorator
	decoratedProperty: string = "";

	@methodDecorator(1, true, "lorem ipsum dolor sit amet")
	method(): string
	{
		return "";
	}
}

@classDecorator
class SomethingElse
{
	@methodDecorator(2, false, "Lipsum")
	methodInSomethingElse(): string
	{
		return "";
	}
}

const type = getType<Something>();
const properties = type.getProperties();
const methods = type.getMethods();

test("Class has decorator", () => {
	expect(type.getDecorators()[0].name).toBe("classDecorator");
});

test("Property has decorator", () => {
	expect(properties[0].getDecorators()[0].name).toBe("propertyDecorator");
});

test("Method has decorator", () => {
	expect(methods[0].getDecorators()[0].name).toBe("methodDecorator");
});

test("Decorator executed correctly", () => {
	expect(ReflectedInfoFromMethodDecorator).toHaveLength(2);
	
	const typeOfSomething = getType<Something>();
	const typeOfSomethingElse = getType<SomethingElse>();
	
	expect(ReflectedInfoFromMethodDecorator[0].typeName).toBe(typeOfSomething.fullName);
	expect(ReflectedInfoFromMethodDecorator[1].typeName).toBe(typeOfSomethingElse.fullName);

	const methodDecorator = typeOfSomething.getMethods()[0].getDecorators().find(d => d.name == "methodDecorator")!;
	
	expect(methodDecorator).toBeDefined();
	
	const args = methodDecorator.getArguments();
	
	expect(args).toHaveLength(3);
	expect(args[0]).toBe(1);
	expect(args[1]).toBe(true);
	expect(args[2]).toBe("lorem ipsum dolor sit amet");
	expect(args[0]).toBe(ReflectedInfoFromMethodDecorator[0].num);
	expect(args[1]).toBe(ReflectedInfoFromMethodDecorator[0].bool);
	expect(args[2]).toBe(ReflectedInfoFromMethodDecorator[0].str);
});