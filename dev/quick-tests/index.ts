import {
	getType,
	Type
} from "tst-reflect";

function foo<T extends string = "">(x: T, y: number)
{
	return 1;
}

const x = function(a: boolean) {}
const y = (a: boolean) => a;

printFunctionInfo(getType<typeof foo>());
printFunctionInfo(getType<typeof x>());
printFunctionInfo(getType<typeof y>());
printFunctionInfo(getType(foo));

function printFunctionInfo(fnc: Type)
{
	console.log("----------------------------------------");
	console.log("function", fnc.name, fnc.fullName);

	if (fnc.function)
	{
		console.log("return type:", fnc.function.returnType.name);
		console.log("parameters:", fnc.function.getParameters().map(param => param.name + ": " + param.type.name).join(", "));
		console.log("type parameters:", fnc.function.getTypeParameters().map(param => param.name).join(", "));
	}
}