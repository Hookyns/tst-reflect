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
		const someService = getType<SomeServiceClass>();

		console.log(someService.ctor, someService.fullName);
		debugger;
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


