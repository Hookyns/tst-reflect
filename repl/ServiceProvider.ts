import {Type}              from "tst-reflect";
import {ServiceCollection} from "./ServiceCollection";

/**
 * Implementation of IServiceProvider
 */
export class ServiceProvider
{
	/**
	 * Service collection
	 */
	private readonly _serviceCollection: ServiceCollection;

	/**
	 * Create service provider on top of service collection
	 * @param serviceCollection
	 */
	constructor(serviceCollection: ServiceCollection)
	{
		this._serviceCollection = serviceCollection;
	}

	/**
	 * Get service instance
	 * @param type
	 */
	getServices<TDependency>(type: Type): Iterable<TDependency>
	{
		const implementations = Array.from(this._serviceCollection.services).find(([dependency, impl]) => type.is(dependency))?.[1];

		if (!implementations || !implementations.length)
		{
			throw new Error(`Type '${type.fullName}' is not registered.`);
		}

		const self = this;

		return {
			[Symbol.iterator]: function* () {
				let ctor, args;

				for (let impl of implementations)
				{
					if (!impl.getConstructors()?.length)
					{
						yield Reflect.construct(impl.ctor, []);
					}

					// Ctor with less parameters prefered
					ctor = impl.getConstructors()
						.sort((a, b) => a.parameters.length > b.parameters.length ? 1 : 0)[0];

					// Resolve parameters
					args = ctor.parameters.map(param => self.getService(param.type))

					yield Reflect.construct(impl.ctor, args);
				}
			}
		};
	}
	
	/**
	 * Get service instance
	 * @param type
	 */
	getService<TDependency>(type: Type): TDependency | null
	{
		return this.getServices<TDependency>(type)[Symbol.iterator]().next().value || null;
	}
}