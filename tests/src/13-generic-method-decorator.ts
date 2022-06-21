import {
	getType,
	Type
} from "tst-reflect";

test("Method decorator reflects generic type", () => {
	/**
	 * @reflect
	 */
	function methodDecorator<TClass>(_: any, __: any)
	{
		const type = getType<TClass>();
		expect(type instanceof Type).toBe(true);
		expect(type).not.toBe(Type.Unknown);
		expect(type.name).toBe("Something");
	}

	function reference<TType>(name: string, description: string)
	{
		expect(name).toBe("Louis Litt");
		expect(description).toBe("description");

		const type = getType<TType>();
		expect(type instanceof Type).toBe(true);
		expect(type).not.toBe(Type.Unknown);
		expect(type.name).toBe("Something");

		return (target: Object, key: string | symbol, descriptor: PropertyDescriptor) => {
			return descriptor;
		};
	}

	/**
	 * @reflect
	 */
	function forward<TType>(name: string)
	{
		return reference<TType>(name, "description");
	}

	class Something
	{
		property: string = "";

		@methodDecorator
		@forward("Louis Litt")
		method(): string
		{
			return "";
		}
	}
});