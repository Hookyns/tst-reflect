import {
	getType,
	Type
} from "tst-reflect";

test("Property decorator reflects generic type", () => {
	/**
	 * @reflect
	 */
	function propertyDecorator<TClass>(_: any, __: any)
	{
		const type = getType<TClass>();
		expect(type instanceof Type).toBe(true);
		expect(type).not.toBe(Type.Unknown);
		expect(type.name).toBe("Something");
	}

	class Something
	{
		@propertyDecorator
		property: string = "";

		method(): string
		{
			return "";
		}
	}
});