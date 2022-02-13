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

	class Something
	{
		property: string = "";

		@methodDecorator
		method(): string
		{
			return "";
		}
	}
});