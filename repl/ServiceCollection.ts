import {Type} from "tst-reflect";

export class ServiceCollection
{
	get services(): IterableIterator<[Type, Array<Type>]>
	{
		return this._services.entries();
	}

	/**
	 * List of added dependencies
	 */
	private readonly _services: Map<Type, Array<Type>> = new Map<Type, Array<Type>>();


	addTransient(dependencyType: Type, dependencyImplementation: Type)
	{
		const value = (this._services.get(dependencyType) || []);
		value.push(dependencyImplementation);

		this._services.set(dependencyType, value);
	}

	addScoped(dependencyType: Type, dependencyImplementation: Type)
	{

	}

	addSingleton(dependencyType: Type, dependencyImplementation: Type)
	{

	}
}