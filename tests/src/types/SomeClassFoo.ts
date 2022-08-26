import { getType } from "tst-reflect";

export class SomeClassFoo
{
	constructor(private name: string)
	{
	}
}

getType<SomeClassFoo>();