import { getType }          from "tst-reflect";
import { BaseGenericClass } from "./BaseGenericClass";
import {
	IntersectionType,
	SomeInterface,
	UnionType
}                           from "./declarations";

export class FinalClass extends BaseGenericClass<{ genFoo: Array<{ genArrBar: string }> }> implements SomeInterface
{
	stringProp: string;
	anyProp: any;
	stringArrayProp: string[];
	arrayProp: Array<string>;
	arrayLiteralProp: [number, string, boolean, Date];
	dateProp: Date;
	numberProp: number;
	objectProp: { objectPropFoo: string, objectPropBar: string; };

	methodType: BaseGenericClass<any>["baseVoidMethod"];

	initializedStringProp = "initializedStringProp";
	initializedAnyProp: any = true;
	initializedStringArrayProp = ["initializedStringArrayProp"];
	initializedArrayProp: Array<string> = ["initializedArrayProp"];
	initializedObjectProp = { foo: "initializedObjectProp-lorem", bar: "initializedObjectProp-ipsum" };
	initializedNumberProp = 4;
	initializedDateProp = new Date(1970, 1, 1);

	unionMethod(): UnionType<string>
	{
		return {
			ok: false
		};
	}

	intersectionMethod(): IntersectionType
	{
		return {
			name: "Inter",
			username: "section",
			email: "section@inter"
		};
	}

	abstractBooleanMethod(bool: boolean)
	{
		return bool;
	}

	guardMethod(obj: any): obj is SomeInterface
	{
		return true;
	}

	conditionalParamMethod<T = void>(...arg: T extends void ? ["Type argument is required"] : []): void
	{

	}
}

getType<BaseGenericClass>();