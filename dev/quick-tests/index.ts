import {
	getType,
	Type
} from "tst-reflect";

import { SomeType }     from "./dir/SomeType.mjs";
import { TsOnlyModule } from "./dir/TsOnly.js";

getType<SomeType>();
getType<TsOnlyModule>();

function dec(..._: any)
{

}

export class Temp
{
	@dec
	id: string;
	email: string;

	get Email()
	{
		return this.email;
	}

	set Id(val)
	{
		this.id = val;
	}

	[prop: string]: any;

	readonly [prop: symbol]: any;

	constructor()
	constructor(x: any)
	constructor(x?: any)
	{
	}

	foo()
	{
		return "";
	}

	bar()
	{

	}
}

type T = {
	[key in keyof Temp]: Temp[key]
} & {
	foo(): boolean;
	prop: string;
}

type R = Record<string, Temp>;

getType<Temp>();
getType<T>();
getType<Record<string, Temp>>();
getType<R>();