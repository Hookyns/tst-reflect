import {
	getType,
	Type
} from "tst-reflect";

test("It is possible to get type of generic type parameter.", () => {
	function infer<T>(): Type
	{
		return getType<T>();
	}

	class A
	{
	}

	expect(infer<A>() instanceof Type).toBe(true);
	expect(infer<A>()).not.toBe(Type.Unknown);
});

test("Get generic type arguments from arrays.", () => {
	interface MyObject {
		numberArray: Array<number>;
		stringArray: ReadonlyArray<string>;
	}

	const t = getType<MyObject>();

	const aNumberArrayProp = t.getProperties().find(p => p.name === 'numberArray')!;
	expect(aNumberArrayProp.type.isArray()).toBeTruthy();
	expect(aNumberArrayProp.type.getTypeArguments()).toHaveLength(1);
	expect(aNumberArrayProp.type.getTypeArguments()![0].name).toBe('Number');

	const aStringArrayProp = t.getProperties().find(p => p.name === 'stringArray')!;
	expect(aStringArrayProp.type.isArray()).toBeTruthy();
	expect(aStringArrayProp.type.getTypeArguments()).toHaveLength(1);
	expect(aStringArrayProp.type.getTypeArguments()![0].name).toBe('String');
});
