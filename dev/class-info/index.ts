import {
	getType,
	reflect
}                           from "tst-reflect";
import { BaseGenericClass } from "./BaseGenericClass";
import { FinalClass }       from "./FinalClass";
import { printClassInfo }   from "./printClassInfo";

function methodDecorator()
{
	return function (a, b) {

	};
}

@reflect()
class Klass
{
	private readonly foo: string;
	bar?: any;
	protected baz: [string | number, number];

	get val(): boolean
	{
		return true;
	}

	set val(val: boolean)
	{

	}

	@methodDecorator()
	fooMethod?()
	{

	}

	private barMethod<A>(a: A): Klass
	{
		return null as any;
	}
}

getType<BaseGenericClass>();
getType<FinalClass>();
printClassInfo<Klass>();
printClassInfo<FinalClass>();