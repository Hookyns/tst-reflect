import { getType }          from "tst-reflect";
import NestedClass          from "./Nested/NestedClass";
import { SomeServiceClass } from "./SomeServiceClass";

const someServiceClassReflected = getType<SomeServiceClass>();
const someServiceClassResolved = Reflect.construct(someServiceClassReflected.ctor, []);

console.log(someServiceClassResolved instanceof SomeServiceClass);
console.log(someServiceClassResolved.someMethod());
console.log(someServiceClassReflected.constructorDescription);
console.log(someServiceClassResolved);


const nestedClassReflected = getType<NestedClass>();
const nestedClassResolved = Reflect.construct(nestedClassReflected.ctor, []);

console.log(nestedClassResolved instanceof NestedClass);
console.log(nestedClassResolved.someMethod());
console.log(nestedClassReflected.constructorDescription);
console.log(nestedClassResolved);
