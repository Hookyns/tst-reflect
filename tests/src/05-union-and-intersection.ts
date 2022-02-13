import {
	getType,
	Type
} from "tst-reflect";

test("Union", () => {
	type A = { a: string, c: boolean };
	type B = { b: number, c: boolean };
	type C = A | B;
	const typeOfA = getType<A>();
	const typeOfB = getType<B>();
	const typeOfC = getType<C>();

	const finalObjProperties = Object.keys(typeOfC.flattenInheritedMembers().properties);

	expect(typeOfC instanceof Type).toBe(true);
	expect(typeOfC).not.toBe(Type.Unknown);
	expect(typeOfC.name).toBe("C");
	expect(typeOfC.union).toBe(true);
	expect(typeOfC.intersection).toBe(false);
	expect(typeOfC.isUnionOrIntersection()).toBe(true);
	expect(typeOfC.types).toBeDefined();
	expect(typeOfC.types).toHaveLength(2);
	expect(typeOfC.types![0]).toBe(typeOfA);
	expect(typeOfC.types![1]).toBe(typeOfB);

	expect(finalObjProperties).toEqual(["c"]);
});

test("Intersection", () => {
	type A = { a: string, c: boolean };
	type B = { b: number, c: boolean };
	type C = A & B;
	const typeOfA = getType<A>();
	const typeOfB = getType<B>();
	const typeOfC = getType<C>();

	const finalObjProperties = Object.keys(typeOfC.flattenInheritedMembers().properties);

	expect(typeOfC instanceof Type).toBe(true);
	expect(typeOfC).not.toBe(Type.Unknown);
	expect(typeOfC.name).toBe("C");
	expect(typeOfC.union).toBe(false);
	expect(typeOfC.intersection).toBe(true);
	expect(typeOfC.isUnionOrIntersection()).toBe(true);
	expect(typeOfC.types).toBeDefined();
	expect(typeOfC.types).toHaveLength(2);
	expect(typeOfC.types![0]).toBe(typeOfA);
	expect(typeOfC.types![1]).toBe(typeOfB);

	expect(finalObjProperties).toEqual(["a", "c", "b"]);
});