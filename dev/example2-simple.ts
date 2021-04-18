import {getType, Type}     from "tst-reflect";
import {IService, Service} from "./dependency";

class ServiceCollection {
	public readonly services: Array<[Type, any]> = [];

	addTransient<TDep, TImp>(dependencyType?: Type, dependencyImplementation?: Type | any) {
		this.services.push([dependencyType ?? getType<TDep>(), dependencyImplementation ?? getType<TImp>()]);
	}
}

class ServiceProvider {
	constructor(serviceCollection: ServiceCollection) { /* ... */ }

	getService<TDependency>(type?: Type): TDependency {
		type ??= getType<TDependency>();
		// ...
		return (null as TDependency);
	}
	
	getServiceGenericOnly<TDependency = undefined>(): TDependency {
		const type = getType<TDependency>();
		// ...
		return (null as TDependency);
	}
}

const serviceCollection = new ServiceCollection();
serviceCollection.addTransient(getType<IService>(), getType<Service>());
// or with generic
serviceCollection.addTransient<IService, Service>();

const serviceProvider = new ServiceProvider(serviceCollection);

const s1 = serviceProvider.getService<IService>();
console.log("Type created using reflection: ", s1);
console.log("s1 is instanceof Service: ", s1 instanceof Service); // true

const s2 = serviceProvider.getServiceGenericOnly<IService>();
console.log("Type created using generic reflection: ", s2);
