import {getType, Type}     from "tst-reflect";
import {IService, Service} from "./dependency";

class ServiceCollection
{
	public readonly services: Array<[Type, any]> = [];

	addTransient<TDep, TImp = any>(dependencyType?: Type, dependencyImplementation?: Type | any)
	{
		this.services.push([dependencyType ?? getType<TDep>(), dependencyImplementation ?? getType<TImp>()]);
	}
}

class ServiceProvider
{
	private serviceCollection: ServiceCollection;
	
	constructor(serviceCollection: ServiceCollection)
	{
		this.serviceCollection = serviceCollection;
	}

	getService<TDependency>(type?: Type): TDependency
	{
		type ??= getType<TDependency>();
		
		const arr = this.serviceCollection.services.find(([dep]) => dep.is(type));
		const impl = arr[1];

		if (!impl)
		{
			throw new Error(`No implementation registered for '${type.name}'`);
		}
		
		if (impl instanceof Type) {
			return Reflect.construct(impl.ctor, []);
		}
		
		return impl;
	}

	getServiceGenericOnly<TDependency>(): TDependency
	{
		return this.getService(getType<TDependency>());
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
