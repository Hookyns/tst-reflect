import {
	DefaultType,
	SimpleUnionType,
	SomeInterface
} from "./declarations";

export abstract class BaseGenericClass<TGenericType extends any = DefaultType, TGenericType2 = TGenericType extends undefined ? string : number> implements SomeInterface
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