import { getType }       from "tst-reflect";
import { AbstractClass } from "./AbstractClass";
import { SomeService }   from "./Service/SomeService";

export class SomeServiceClass
{
	someMethod()
	{
		return "Hi :)";
	}
}

export class AnotherServiceClassWithAbstract extends AbstractClass
{
	someMethod()
	{
		return "Hi :)";
	}

	getAType()
	{
		// const ttt = getType<SomeService>();
		// const firstKey = Object.keys(process["tst-reflect-store"].store)[0];
		// return process["tst-reflect-store"].__typeGetter(Number(firstKey));
	}

	methodAbstract()
	{
		return "Another hi :)";
	}
}

export default class AnotherServiceClass
{
	someMethod()
	{
		return "Hi :)";
	}
}


