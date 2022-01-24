import {
	getType,
	Type
} from "tst-reflect";

type MethodParamsType = {
	name: string
}

// function method(param: string)
// {
// }
//
// const methodTwo = (anotherParam: string) => {
// };

class WithMethods
{
	method(param: string)
	{
	}

	methodParamsType({ name }: MethodParamsType)
	{
	}

	methodParams(params?: MethodParamsType)
	{
	}
}

const withMethodsType = getType<WithMethods>();
const methods = withMethodsType.getMethods();

for (let method of methods)
{
	const params = method.getParameters();

	for (let param of params)
	{
		console.log(`[${method.name}]: Name: ${param.name}`);
		console.log(`[${method.name}]: Optional?: ${param.optional}`);
		if (param.type instanceof Type)
		{
			console.log(`[${method.name}]: isLiteral?: ${param.type.isLiteral()}`);
			console.log(`[${method.name}]: Type: ${JSON.stringify(param.type, null, 4)}`);
			console.log(`[${method.name}]: Type Properties: ${JSON.stringify(param.type.getProperties(), null, 4)}`);
		}
	}

}

