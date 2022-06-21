import {
	getType,
	Type
} from "tst-reflect";

test("Class decorator reflects generic type", () => {
	/**
	 * @reflect
	 */
	function classDecorator<TClass>(_: any)
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

		return (ctor: Function) => {
			
		};
	}

	/**
	 * @reflect
	 */
	function forward<TType>(name: string)
	{
		return reference<TType>(name, "description");
	}

	@classDecorator
	@forward("Louis Litt")
	class Something
	{
		property: string = "";

		method(): string
		{
			return "";
		}
	}
});