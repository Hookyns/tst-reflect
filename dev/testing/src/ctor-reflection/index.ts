import { getType }          from "tst-reflect";
import { SomeServiceClass } from "./SomeServiceClass";
import AnotherServiceClass  from "./SomeServiceClass";

const typeTwo = getType<AnotherServiceClass>();
const type = getType<SomeServiceClass>();
// const instance = Reflect.construct(type.ctor, []);


const ctor = type.getConstructor();
console.log(ctor);

const resolved = Reflect.construct(ctor, []);

console.log(resolved);
