import {
	getType,
	Type
} from "tst-reflect";
//
// class A
// {
// 	constructor(public foo: string)
// 	{
// 	}
// }
//
// const someValue: unknown = new A("Lorem ipsum");
// console.log(getType(someValue).is(getType<A>())); // > true
//
// const someValue2: unknown = { foo: "dolor sit amet" };
// console.log(getType(someValue2).is(getType<A>())); // > false
// console.log(getType(someValue2).isAssignableTo(getType<A>())); // > true

interface IExpectedTypeOfTheResponse
{
	foo: string[];
	bar: number;
	baz: boolean;
}

const response: unknown = { foo: ["a", "b"], bar: 99, baz: false, lorem: "ipsum" }; // await api.get("/something");

if (isResponseOfType<IExpectedTypeOfTheResponse>(response))
{
	console.log("Je to očekávaný typ");
}

function isResponseOfType<TType>(response: unknown): response is TType
{
	const type: Type = getType<TType>(); // <= fungující runtime genericita
	const receivedType: Type = getType(response);

	return receivedType.isAssignableTo(type);
}