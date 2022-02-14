import { getType } from "tst-reflect";

interface ISomeInterface
{
	stringProp: string;
	numberProp: number;
	booleanProp: boolean;
	arrayProp: Array<string>;
	stringOrNumber: string | number;
}

class SomeClass
{
	stringProp: string;
	anyProp: any;
	stringArrayProp: string[];

	constructor(stringProp: string, stringArrayProp: string[])
	{
		this.stringProp = stringProp;
		this.stringArrayProp = stringArrayProp;
	}

	optionalMethod?(this: ISomeInterface, size: number): void
	{
	}
}

test("Type.isAssignableTo()", () => {
	const someObject = {
		anyProp: true,
		stringProp: "",
		stringArrayProp: ["foo"],

		optionalMethod()
		{
		}
	};

	const someObject2 = {
		stringProp: "",
		numberProp: 123,
		booleanProp: true,
		arrayProp: ["foo"],
		stringOrNumber: 0
	};

	const someObject3 = {
		stringProp: "",
		numberProp: 123
	};

	const someObject4 = {
		anyProp: new Date(),
		stringProp: "",
		numberProp: 123,
		booleanProp: false,
		stringArrayProp: ["foo"],
		stringOrNumber: "lorem",
		arrayProp: ["bar"]
	};

	const someInterfaceType = getType<ISomeInterface>();
	const someClassType = getType<SomeClass>();

	const obj1Type = getType(someObject);
	const obj2Type = getType(someObject2);
	const obj3Type = getType(someObject3);
	const obj4Type = getType(someObject4);

	expect(obj1Type.isAssignableTo(someInterfaceType)).toBeFalsy();
	expect(obj1Type.isAssignableTo(someClassType)).toBeTruthy();

	expect(obj2Type.isAssignableTo(someInterfaceType)).toBeTruthy();
	expect(obj2Type.isAssignableTo(someClassType)).toBeFalsy();

	expect(obj3Type.isAssignableTo(someInterfaceType)).toBeFalsy();
	expect(obj3Type.isAssignableTo(someClassType)).toBeFalsy();

	expect(obj4Type.isAssignableTo(someInterfaceType)).toBeTruthy();
	expect(obj4Type.isAssignableTo(someClassType)).toBeTruthy();
});