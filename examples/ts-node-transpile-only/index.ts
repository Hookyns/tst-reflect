import {
	getType,
	Parameter
} from "tst-reflect";

type SomeType<T> = T extends Error
	? false | null | undefined | unknown | void | Pick<Error, "message"> | T
	: never;

export class SomeClass
{
	prop: true = true;
	public readonly readonlyProp: SomeType<Error>;

	get getter(): SomeType<Error>
	{
		return this.readonlyProp;
	}

	set setter(val: SomeType<Error>)
	{
	}

	constructor();
	constructor(a?: boolean);
	constructor(b?: string);
	constructor(a: boolean, b?: string);
	constructor(private aOrB?: boolean | string, b?: string)
	{
		this.readonlyProp = b === undefined ? false : new Error();
	}

	someMethod<T>(a?: boolean): void;
	someMethod(b?: string): string;
	someMethod<T>(aOrB?: boolean | string): void | string
	{
	}

	someOtherMethod(): number
	{
		return Math.random();
	}

	someOptionalMethod?(): boolean
	{
		return this.prop;
	}
}

function someFunction(a?: boolean): string;
function someFunction<U, V extends string>(b?: string): number;
function someFunction(aOrB?: boolean | string): string | number
{
	return "";
}

const type = getType<SomeClass>();

console.log("Constructors:");
console.table(
	type.getConstructors()?.map((c) => c.getParameters().map(mapParam))
);

console.log("Methods:");
console.table(
	type.getMethods().map((m) => [m.name, m.getParameters().map(mapParam)])
);

const fnc = getType<typeof someFunction>();
console.log("Functions:");
console.table(
	fnc
		.getSignatures()
		.map((m) => [fnc.name, m.getParameters().map(mapParam), m.returnType.name])
);

function mapParam(param: Parameter)
{
	return (
		param.name + (param.optional ? "?" : "") + ": " + param.type.toString()
	);
}
