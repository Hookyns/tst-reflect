import { getType } from "tst-reflect";

function inferType<TType>()
{
	return getType<TType>().name;
}

const variable = 5;

console.log(inferType<typeof variable>()); // > "number"