import {getType} from "../types";
import {IService, Service} from "./dependency";

// function getType<T>(): TypeOf<T>
// {
// 	return null as any;
// }

function myFunc<T>()
{
	const t = getType<T>();

	console.log(t);
}

const logger = {
	log(msg)
	{
		console.log(msg);
	}
};

console.log(getType<Service>());
console.log(getType<Service>());
console.log(getType<Service>());

const s1 = new Service(logger);
s1.whoAmI();

myFunc<IService>();
