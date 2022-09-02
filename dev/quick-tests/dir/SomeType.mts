import { getType } from "tst-reflect";

export const SomeString = "SomeTypeString";

export class SomeType
{
	foo()
	{
		return SomeString;
	}
	
	bar?()
	{
		return SomeString;
	}
}

getType<SomeType>();