import {
	getType,
	Parameter
} from "tst-reflect";

export class SomeClass
{
	prop: true;

	constructor();
	constructor(a?: boolean);
	constructor(b?: string);
	constructor(a: boolean, b?: string);
	constructor(aOrB?: boolean | string, b?: string)
	{
	}

	someMethod(a?: boolean);
	someMethod(b?: string);
	someMethod(aOrB?: boolean | string)
	{
	}

	someOtherMethod()
	{
	}
}


function someMethod(a?: boolean): string
function someMethod(b?: string): number
function someMethod(aOrB?: boolean | string): string | number
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

const fnc = getType<typeof someMethod>();
console.log("Functions:");
console.table(
	fnc.getSignatures().map(m => [fnc.name, m.getParameters().map(mapParam), m.returnType.name])
);

function mapParam(param: Parameter)
{
	return param.name + (param.optional ? "?" : "") + ": " + param.type.toString();
}