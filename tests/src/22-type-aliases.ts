import {
	getType,
	Type,
	TypeKind
} from "tst-reflect";

test("getType<typeof function>() of function", () => {
	type O = {
		foo: string;
		bar: number;
	};
	
	type R = Record<string, number>;
	type Oo = Omit<O, "bar">;
	
	type K = {
		[key in keyof O]?: O[key]
	}

	const typeO = getType<O>();
	const typeR = getType<R>();
	const typeOo = getType<Oo>();
	const typeK = getType<K>();
	
	expect(typeO.getProperties()).toHaveLength(2);
	expect(typeO.getProperties().map(p => p.name)).toEqual(expect.arrayContaining(["foo", "bar"]));
	
	expect(typeR.getIndexes()).toHaveLength(1);
	expect(typeR.getProperties()).toHaveLength(0);
	expect(typeR.getIndexes()[0].keyType).toBe(getType<string>());
	
	expect(typeOo.getProperties()).toHaveLength(1);
	expect(typeOo.getProperties()[0].name).toBe("foo");
	
	expect(typeK.getProperties()).toHaveLength(2);
	expect(typeK.getProperties()[0].name).toBe("foo");
	expect(typeK.getProperties()[0].optional).toBeTruthy();
	expect(typeK.getProperties()[1].name).toBe("bar");
});