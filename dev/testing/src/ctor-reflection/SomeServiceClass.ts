import { AbstractClass } from "./AbstractClass";

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


