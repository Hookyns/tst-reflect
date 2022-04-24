import { getType, Type }   from "tst-reflect";
import { SomeClass, SomeParentClass, ISomeInterface } from "./somewhere";
import { formatProperty, formatMethod, formatConstructor } from "./formatters";

const typeOfSomeClass: Type = getType<SomeClass>();

console.log("Base type:", typeOfSomeClass.baseType.name);
console.log("Base type's interface:", typeOfSomeClass.baseType.interface.name);

console.log("\tConstructors");
console.log(typeOfSomeClass.getConstructors().map(formatConstructor).join("\n"));

console.log("\tProperties");
console.log(typeOfSomeClass.getProperties().map(formatProperty).join("\n"));

console.log("\tMethods");
console.log(typeOfSomeClass.getMethods().map(formatMethod).join("\n"));

const someClass = new SomeClass("Name of the SomeClass");

console.log("instanceof SomeClass", someClass instanceof SomeClass);
console.log("instanceof SomeParentClass", someClass instanceof SomeParentClass);
console.log("getType(value) equals to getType<T>()", getType(someClass).is(typeOfSomeClass));
console.log("implements ISomeInterface", typeOfSomeClass.isDerivedFrom(getType<ISomeInterface>()));

const someObj = {
	name: "Some Object",
	reflection: true,
	doSomething() {
		console.log("Something");
	}
}

// console.log("Some object is assignable to ISomeInterface", getType(someObj).isAssignableTo(getType<ISomeInterface>()));

