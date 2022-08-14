import {
	getType,
	Type
} from "tst-reflect";

test("getType<T>() gets index property", () => {
	interface ObjectWithIndexProperty
	{
		a: string;
		b: number;
		[name: string]: string | number;
		[name: symbol]: boolean;
	}

	const type = getType<ObjectWithIndexProperty>();
	
	const properties = type.getProperties();
	expect(properties).toHaveLength(2);
	
	const indexes = type.getIndexes();
	expect(indexes).toHaveLength(2);
	
	const index1 = indexes.find(i => i.type.isUnion());
	const index2 = indexes.find(i => i != index1);
	
	expect(index1).toBeTruthy();
	expect(index2).toBeTruthy();

	expect(index1!.keyType.isString()).toBeTruthy();
	expect(index1!.type.isUnion()).toBeTruthy();
	
	expect(index2!.keyType.isSymbol()).toBeTruthy();
	expect(index2!.type.isBoolean()).toBeTruthy();
});
