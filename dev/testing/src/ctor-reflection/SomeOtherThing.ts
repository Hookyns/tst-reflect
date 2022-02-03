export class SomeServiceClass
{
	someMethod()
	{
		return "Hi :)";
	}
}

export default {
	something: SomeServiceClass,
	somethingElse: class Something
	{
		someThingElse()
		{
			return "hi:)";
		}
	}
};
