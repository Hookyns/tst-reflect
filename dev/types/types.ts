import { getType } from "tst-reflect";

module foobar
{
	export function foo()
	{
	}

	export class Bar
	{
	}
}

type SimpleUnionType = string | number;

type UnionType<TResult> = {
	ok: true,
	result: TResult
} | {
	ok: false
}

type IntersectionType = {
	name: string;
	email: string;
} & {
	name: string;
	username: string;
}

interface SomeInterface
{
	stringProp: string;
	anyProp: any;
	stringArrayProp: string[];
	arrayProp: Array<string>;
	moduleProp?: typeof foobar;

	optionalMethod?(this: SomeInterface, size: number): void;
}

type DefaultType = undefined;

enum SomeEnum {
	One,
	Two
}

abstract class BaseGenericClass<TGenericType extends any = DefaultType, TGenericType2 = TGenericType extends undefined ? string : number> implements SomeInterface
{
	private readonly initValue: TGenericType;

	public anyProp: any;
	public arrayProp: Array<string>;
	public stringArrayProp: string[];
	public stringProp: string;
	public someUnionProp: SimpleUnionType;

	constructor(initValue: TGenericType)
	constructor(initValue: TGenericType, anyProp: undefined)
	constructor(initValue: TGenericType, anyProp?: TGenericType2)
	constructor(initValue: TGenericType, anyProp?: any)
	{
		this.initValue = initValue;
		this.anyProp = anyProp;
	}

	baseVoidMethod(message: string): void
	{
		console.log(message);
	}

	abstract abstractBooleanMethod(bool: boolean): boolean;
}

class FinalClass extends BaseGenericClass<{ genFoo: Array<{ genArrBar: string }> }> implements SomeInterface
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
	someEnum: SomeEnum = SomeEnum.One;
	NumberObject: Number = 0;
	StringObject: String = "str";
	ObjectObject: Object = {};
	date: Date;

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

console.log(getType<FinalClass>());
