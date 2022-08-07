import {
	getType,
	Type
} from "tst-reflect";

test("Property decorator reflects generic type", () => {
	/**
	 * @reflect
	 */
	function propertyDecorator<TClass>(target: any, propertyName: string | symbol)
	{
		const type = getType<TClass>();
		expect(type instanceof Type).toBe(true);
		expect(type).not.toBe(Type.Unknown);
		expect(type.name).toBe("Something");
		expect(typeof(target.constructor)).toBe("function");
		expect(target.constructor.name).toBe("Something");
		expect(propertyName).toBe("property");
	}

	function reference<TType>(name: string, description: string)
	{
		expect(name).toBe("Louis Litt");
		expect(description).toBe("description");

		const type = getType<TType>();
		expect(type instanceof Type).toBe(true);
		expect(type).not.toBe(Type.Unknown);
		expect(type.name).toBe("Something");

		return (target: any, propertyName: string | symbol) => {
			expect(typeof(target.constructor)).toBe("function");
			expect(target.constructor.name).toBe("Something");
			expect(propertyName).toBe("property");
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
		@propertyDecorator
		@forward("Louis Litt")
		property: string = "";

		method(): string
		{
			return "";
		}
	}
});