import { SomeEnum } from "./SomeEnum";

export function property(str: string, num: number, enu: SomeEnum, any: any)
{
	console.log("property", str, num, enu, any);
	return function (_, __) {};
}