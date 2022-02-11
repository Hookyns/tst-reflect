import {
	getType,
	reflect
}                     from "tst-reflect";
import { property }   from "./property";
import { SomeEnum }   from "./SomeEnum";
import { SomeString } from "./SomeType";

const MyString = "SomeType";

/**
 * @reflectDecorator
 */
function klass<TType>(str: string, num: number, enu: SomeEnum)
{
	console.log("klass", str, num, enu);
	const t = getType<TType>();

	console.log(t.getDecorators().map(d => "\tdecorator: " + d.name + " args:" + d.getArguments().join(", ")));
	return function <T>(Constructor: { new(...args: any[]): T }) {
	};
}

@klass(MyString, 5, SomeEnum.One)
@reflect()
class A
{
	@property("Foo property", 5, SomeEnum.One, { foo: "f", bar: 5, baz: SomeEnum.Two })
	foo: string;

	@property(SomeString, 5, SomeEnum.Two, true)
	get bar(): number
	{
		return 0;
	}
}

@reflect()
class B
{
}

const a: any = new A();
const typeOfVarA = getType(a);
console.log(typeOfVarA.name); // > "A"

const typeOfA = getType<A>();
console.log(typeOfA.name, typeOfVarA.is(typeOfA), typeOfVarA == typeOfA); // > "A", true, true


const array: any = [new A(), new B()];

const typeOfArray = getType(array);
console.log(typeOfArray.isArray()); // > true
const arrayTypeArg = typeOfArray.getTypeArguments()[0];
console.log(arrayTypeArg.union); // > true
console.log(arrayTypeArg.types.map(arg => arg.name).join(", ")); // > "A, B"