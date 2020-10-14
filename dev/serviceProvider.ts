import {ServiceCollection} from "./ServiceCollection";
import {Type}              from "../types";

export class ServiceProvider
{
	private readonly _serviceCollection: ServiceCollection;

	constructor(serviceCollection: ServiceCollection)
	{
		this._serviceCollection = serviceCollection;
	}

	getService<TDependency>(type: Type): TDependency | TDependency[]
	{
		const implementations = Array.from(this._serviceCollection.services).find(([dependency, impl]) => type.is(dependency))?.[1];
		
		if (!implementations || !implementations.length) {
			throw new Error(`Type '${type.fullName}' is not registered.`);
		}
		
		if (implementations.length == 1) {
			return Reflect.construct(implementations[0].ctor, []);
		}
		
		return implementations.map(impl => Reflect.construct(impl.ctor, []));
	}
}