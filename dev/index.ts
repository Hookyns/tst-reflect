import {getType}           from "../types";
import {IService, Service} from "./dependency";
import {ServiceCollection} from "./ServiceCollection";
import {ServiceProvider}   from "./serviceProvider";

const serviceCollection = new ServiceCollection();
serviceCollection.addTransient(getType<IService>(), getType<Service>());

const serviceProvider = new ServiceProvider(serviceCollection);

const s1 = serviceProvider.getService<IService>(getType<IService>());
console.log("Type created using reflection: ", s1);

function myFunc<T>()
{
	// const t = getType<T>(); // Not working YET! TODO: Implement generic type referencing on runtime.
	// console.log(t);
}

const logger = {
	log(msg)
	{
		console.log(msg);
	}
};

const s2 = new Service(logger);
s2.whoAmI();

myFunc<IService>();
