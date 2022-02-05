import { isValid }       from "./isValid";

export interface SomeInterface
{
	stringProp: string;
	numberProp: number;
	booleanProp: boolean;
	arrayProp: Array<string>;
	stringOrNumber: string | number;
}

export class SomeClass
{
	stringProp: string;
	anyProp: any;
	stringArrayProp: string[];

	optionalMethod?(this: SomeInterface, size: number): void { }
}

type TypeLit = SomeInterface | SomeClass;

const someObject = {
	anyProp: true,
	stringProp: "",
	stringArrayProp: ["foo"],
	
	optionalMethod() { }
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
	numberProp: 123,
};

console.log("someObject is SomeInterface: ", isValid<SomeInterface>(someObject));
console.log("someObject is SomeClass: ", isValid<SomeClass>(someObject));

console.log("someObject2 is SomeInterface: ", isValid<SomeInterface>(someObject2));
console.log("someObject2 is SomeClass: ", isValid<SomeClass>(someObject2));

console.log("someObject3 is SomeInterface: ", isValid<SomeInterface>(someObject3));
console.log("someObject3 is SomeClass: ", isValid<SomeClass>(someObject3));

console.log("instanceof: ", isValid<SomeClass>(new SomeClass()));

// console.log("someObject is TypeLit: ", isValid<TypeLit>(someObject));
// console.log("someObject2 is TypeLit: ", isValid<TypeLit>(someObject2));
// console.log("someObject3 is TypeLit: ", isValid<TypeLit>(someObject3));