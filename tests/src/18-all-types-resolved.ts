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

	public anyProp!: any;
	public arrayProp!: Array<string>;
	public stringArrayProp!: string[];
	public stringProp!: string;
	public someUnionProp!: SimpleUnionType;

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
	stringProp!: string;
	anyProp: any;
	stringArrayProp!: string[];
	arrayProp!: Array<string>;
	arrayLiteralProp!: [number, string, boolean, Date];
	dateProp!: Date;
	numberProp!: number;
	objectProp!: { objectPropFoo: string, objectPropBar: string; };

	methodType!: BaseGenericClass<any>["baseVoidMethod"];
	someEnum: SomeEnum = SomeEnum.One;
	NumberObject: Number = 0;
	StringObject: String = "str";
	ObjectObject: Object = {};
	date!: Date;

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

test("getType<T>() is transformed and it is not Type.Unknown", () => {
	expect(getType<FinalClass>().name).toBe("FinalClass");
	expect(getType<BaseGenericClass>().name).toBe("BaseGenericClass");
	expect(getType<SomeInterface>().name).toBe("SomeInterface");
	expect(getType<SomeEnum>().name).toBe("SomeEnum");
	expect(getType<DefaultType>().name).toBe("undefined"); // TypeScript simplify types. DefaultType = undefined so it is just "undefined". No type container is created.
	expect(getType<IntersectionType>().name).toBe("IntersectionType");
	expect(getType<UnionType<string>>().name).toBe("UnionType");
	expect(getType<SimpleUnionType>().name).toBe("SimpleUnionType");
	expect(getType<typeof foobar>().name).toBe("foobar");
});