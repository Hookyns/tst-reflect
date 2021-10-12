import {
    Type,
    getType
} from "../../runtime";

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

    /**
     * Add transient dependency into collection.
     */
    addTransient<TDependency, TImplementation>()
    /**
     * Add transient dependency into collection.
     * @param dependencyType
     * @param dependencyImplementation
     */
    addTransient<TDependency, TImplementation>(dependencyType: Type, dependencyImplementation: Type)
    /**
     * Add transient dependency into collection.
     * @param dependencyType
     * @param dependencyImplementation
     */
    addTransient<TDependency, TImplementation>(dependencyType?: Type, dependencyImplementation?: Type)
    {
        if (dependencyType === undefined)
        {
            dependencyType = getType<TDependency>();
        }
        
        if (dependencyImplementation === undefined)
        {
            dependencyImplementation = getType<TImplementation>();
        }

        const value = (this._services.get(dependencyType) || []);
        value.push(dependencyImplementation);

        this._services.set(dependencyType, value);
    }

    // addScoped(dependencyType: Type, dependencyImplementation: Type)
    // {
    //
    // }

    // addSingleton(dependencyType: Type, dependencyImplementation: Type)
    // {
    //
    // }
}