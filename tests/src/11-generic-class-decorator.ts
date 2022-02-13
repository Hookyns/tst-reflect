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

	@classDecorator
	class Something
	{
		property: string = "";

		method(): string
		{
			return "";
		}
	}
});