import { SomeClassFoo } from "./SomeClassFoo";

export class SomeClassBaz
{
	public readonly foo: SomeClassFoo;

	constructor(private name: string)
	{
		this.foo = new SomeClassFoo("foo");
	}
}