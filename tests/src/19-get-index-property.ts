import {
	getType,
	Type
} from "tst-reflect";
import * as ts from "typescript";

test("getType<T>() gets index property", () => {
	interface ObjectWithIndexProperty
	{
		a: string;
		b: number;
		[name: string]: string|number;
	}

	const type = getType<ObjectWithIndexProperty>();
	const properties = type.getProperties();
	expect(properties).toHaveLength(3);
	const indexProp = properties.find(prop => prop.name == ts.InternalSymbolName.Index)!;
	expect(indexProp.type.types).toHaveLength(2);
	expect(indexProp.type.types![0].fullName).toBe('String');
	expect(indexProp.type.types![1].fullName).toBe('Number');
});
