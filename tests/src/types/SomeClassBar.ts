import { SomeClassFoo } from "./SomeClassFoo";

export class SomeClassBar
{
	public readonly foo: SomeClassFoo;

	constructor(private name: string)
	{
		this.foo = new SomeClassFoo("foo");
	}
}