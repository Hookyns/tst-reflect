import { Type } from "../../runtime/reflect";
import { ServiceCollectionEntry } from "./ServiceCollectionEntry";
import { ServiceDescriptor }      from "./ServiceDescriptor";
import { ServiceFactory }         from "./ServiceFactory";

export interface IServiceCollection
{
    /**
     * Iterator with all added service entries.
     */
    readonly services: IterableIterator<ServiceCollectionEntry>;

    /**
     * Add dependency into the collection.
     * @param entry
     */
    add(entry: ServiceDescriptor | ServiceCollectionEntry): IServiceCollection;

    /**
     * Add dependencies from another collection.
     * @param collection
     */
    add(collection: IServiceCollection): IServiceCollection;


    /**
     * Add transient dependency into the collection.
     * @reflectGeneric
     */
    addTransient<TService, TImplementation>(): IServiceCollection;

    /**
     * Add transient dependency into the collection.
     * @reflectGeneric
     * @param instance
     */
    addTransient<TService>(instance: any): IServiceCollection;

    /**
     * Add transient dependency into the collection.
     * @reflectGeneric
     * @param factory
     */
    addTransient<TService>(factory: ServiceFactory): IServiceCollection;

    /**
     * Add transient dependency into the collection.
     * @param serviceType
     * @param implementation
     */
    addTransient(serviceType: Type, implementation: Type): IServiceCollection;

    /**
     * Add transient dependency into the collection.
     * @param serviceType
     * @param instance
     */
    addTransient(serviceType: Type, instance: any): IServiceCollection;

    /**
     * Add transient dependency into the collection.
     * @param serviceType
     * @param factory
     */
    addTransient(serviceType: Type, factory: ServiceFactory): IServiceCollection;

    /**
     * Add transient dependency into the collection.
     * @param serviceIdentifier
     * @param implementation
     */
    addTransient(serviceIdentifier: string, implementation: Type): IServiceCollection;

    /**
     * Add transient dependency into the collection.
     * @param serviceIdentifier
     * @param instance
     */
    addTransient(serviceIdentifier: string, instance: any): IServiceCollection;

    /**
     * Add transient dependency into the collection.
     * @param serviceIdentifier
     * @param factory
     */
    addTransient(serviceIdentifier: string, factory: ServiceFactory): IServiceCollection;


    /**
     * Add scoped dependency into the collection.
     * @reflectGeneric
     */
    addScoped<TService, TImplementation>(): IServiceCollection;

    /**
     * Add scoped dependency into the collection.
     * @reflectGeneric
     * @param instance
     */
    addScoped<TService>(instance: any): IServiceCollection;

    /**
     * Add scoped dependency into the collection.
     * @reflectGeneric
     * @param factory
     */
    addScoped<TService>(factory: ServiceFactory): IServiceCollection;

    /**
     * Add scoped dependency into the collection.
     * @param serviceType
     * @param implementation
     */
    addScoped(serviceType: Type, implementation: Type): IServiceCollection;

    /**
     * Add scoped dependency into the collection.
     * @param serviceType
     * @param instance
     */
    addScoped(serviceType: Type, instance: any): IServiceCollection;

    /**
     * Add scoped dependency into the collection.
     * @param serviceType
     * @param factory
     */
    addScoped(serviceType: Type, factory: ServiceFactory): IServiceCollection;

    /**
     * Add scoped dependency into the collection.
     * @param serviceIdentifier
     * @param implementation
     */
    addScoped(serviceIdentifier: string, implementation: Type): IServiceCollection;

    /**
     * Add scoped dependency into the collection.
     * @param serviceIdentifier
     * @param instance
     */
    addScoped(serviceIdentifier: string, instance: any): IServiceCollection;

    /**
     * Add scoped dependency into the collection.
     * @param serviceIdentifier
     * @param factory
     */
    addScoped(serviceIdentifier: string, factory: ServiceFactory): IServiceCollection;


    /**
     * Add singleton dependency into the collection.
     */
    addSingleton<TService, TImplementation>(): IServiceCollection;

    /**
     * Add singleton dependency into the collection.
     * @reflectGeneric
     * @param instance
     */
    addSingleton<TService>(instance: any): IServiceCollection;

    /**
     * Add singleton dependency into the collection.
     * @reflectGeneric
     * @param factory
     */
    addSingleton<TService>(factory: ServiceFactory): IServiceCollection;

    /**
     * Add singleton dependency into the collection.
     * @param serviceType
     * @param implementation
     */
    addSingleton(serviceType: Type, implementation: Type): IServiceCollection;

    /**
     * Add singleton dependency into the collection.
     * @param serviceType
     * @param instance
     */
    addSingleton(serviceType: Type, instance: any): IServiceCollection;

    /**
     * Add singleton dependency into the collection.
     * @param serviceType
     * @param factory
     */
    addSingleton(serviceType: Type, factory: ServiceFactory): IServiceCollection;

    /**
     * Add singleton dependency into the collection.
     * @param serviceIdentifier
     * @param implementation
     */
    addSingleton(serviceIdentifier: string, implementation: Type): IServiceCollection;

    /**
     * Add singleton dependency into the collection.
     * @param serviceIdentifier
     * @param instance
     */
    addSingleton(serviceIdentifier: string, instance: any): IServiceCollection;

    /**
     * Add singleton dependency into the collection.
     * @param serviceIdentifier
     * @param factory
     */
    addSingleton(serviceIdentifier: string, factory: ServiceFactory): IServiceCollection;
}