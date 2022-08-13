import {
	getType,
	Type
}                   from "tst-reflect";

interface Foo {}
interface Bar {}
interface Logger<T> {}

console.log(getType<Logger<Foo>>().fullName)
console.log(getType<Logger<Bar>>().fullName)
console.log(getType<Array<string>>().fullName)
console.log(getType<Array<number>>().fullName)