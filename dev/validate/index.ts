import { isValid }       from "./isValid";

export interface SomeInterface
{
	stringProp: string;
	numberProp: number;
	booleanProp: boolean;
	arrayProp: Array<string>;
}

export class SomeClass
{
	stringProp: string;
	anyProp: any;
	stringArrayProp: string[];

	optionalMethod?(this: SomeInterface, size: number): void { }
}

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
	arrayProp: ["foo"]
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