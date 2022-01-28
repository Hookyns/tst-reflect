import { getType }              from "tst-reflect";
import { SomeService }          from "./Service/SomeService";
import { SomeServiceInterface } from "./Service/SomeServiceInterface";
import { TestingClass }         from "./TestingClass";

// import NestedClass          from "./Nested/NestedClass";
// import { SomeServiceClass } from "./SomeServiceClass";
//
// const someServiceClassReflected = getType<SomeServiceClass>();
// const someServiceClassResolved = Reflect.construct(someServiceClassReflected.ctor, []);
//
// console.log(someServiceClassResolved instanceof SomeServiceClass);
// console.log(someServiceClassResolved.someMethod());
// console.log(someServiceClassReflected.constructorDescription);
// console.log(someServiceClassResolved);
//
//
// const nestedClassReflected = getType<NestedClass>();
// const nestedClassResolved = Reflect.construct(nestedClassReflected.ctor, []);
//
// console.log(nestedClassResolved instanceof NestedClass);
// console.log(nestedClassResolved.someMethod());
// console.log(nestedClassReflected.constructorDescription);
// console.log(nestedClassResolved);



const interfaceType    = getType<SomeServiceInterface>();
const someServiceClass = getType<SomeService>();
const testingClass = getType<TestingClass>();

debugger
