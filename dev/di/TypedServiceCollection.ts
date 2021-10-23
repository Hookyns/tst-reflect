import {
	getType,
	Type
} from "../../runtime/reflect";
import { IServiceCollection }     from "./IServiceCollection";
import { IServiceProvider }       from "./IServiceProvider";
import { Lifetime }               from "./Lifetime";
import { ServiceCollectionEntry } from "./ServiceCollectionEntry";
import { ServiceDescriptor }      from "./ServiceDescriptor";
import { ServiceFactory }         from "./ServiceFactory";

/**
 * Service collection working with Type instances. Based on tst-reflect-transformer.
 */
export class TypedServiceCollection implements IServiceCollection
{
    /**
     * List of all added services.
     */
    private readonly _services: Map<string, ServiceCollectionEntry> = new Map<string, ServiceCollectionEntry>();

    /**
     * Iterator with all added service entries.
     */
    public get services(): IterableIterator<ServiceCollectionEntry>
    {
        return this._services.values();
    }

    private static isServiceDescriptor(obj: any): obj is ServiceDescriptor
    {
        return obj && obj.hasOwnProperty("serviceIdentifier") && obj.hasOwnProperty("lifetime");
    }

    private static isServiceCollectionEntry(obj: any): obj is ServiceCollectionEntry
    {
        return obj && obj.hasOwnProperty("serviceIdentifier") && obj.hasOwnProperty("descriptors");
    }

    private static isIServiceCollection(obj: any): obj is IServiceCollection
    {
        return obj && obj.hasOwnProperty("services");
    }

    /**
     * Adds ServiceDescriptor into the collection.
     * @param {ServiceDescriptor} descriptor
     * @private
     */
    private addServiceDescriptor(descriptor: ServiceDescriptor)
    {
        let entry: ServiceCollectionEntry | undefined = this._services.get(descriptor.serviceIdentifier);

        if (!entry)
        {
            entry = {
                serviceIdentifier: descriptor.serviceIdentifier,
                descriptors: []
            };

            this._services.set(descriptor.serviceIdentifier, entry);
        }

        entry.descriptors.push(descriptor);
    }

    /**
     * Resolves instance of implementation via Type.
     * @param {IServiceProvider} provider
     * @param {Type} impl
     * @private
     */
    private static resolveType(provider: IServiceProvider, impl: Type)
    {
        if (!impl.ctor) throw new Error(`Unable to construct type '${impl.fullName}'. Type contains no reference to the ctor.`);

        const constructors = impl.getConstructors();

        if (!constructors?.length)
        {
            return Reflect.construct(impl.ctor, []);
        }

        // Ctor with less parameters preferred
        const constructor = constructors.sort((a, b) => a.parameters.length > b.parameters.length ? 1 : 0)[0];

        // Resolve parameters
        const args = constructor.parameters.map(param => {
            const service = provider.getServices(param.type)[Symbol.iterator]().next().value;

            if (service === undefined)
            {
                if (param.optional)
                {
                    return undefined;
                }

                throw new Error(`Error while construction of type '${impl.fullName}'. Unable to resolve constructor parameter '${param.name}'.`
                    + `Type of parameter '${param.type.fullName}' cannot be resolved and parameter is not optional.`);
            }

            return service;
        });

        return Reflect.construct(impl.ctor, args);
    }

    /**
     * Returns ServiceFactory for given implementation Type.
     * @param {Type} implementation
     * @return {ServiceFactory}
     * @private
     */
    private static getTypeFactory(implementation: Type): ServiceFactory
    {
        return provider => TypedServiceCollection.resolveType(provider, implementation);
    }

    /**
     * @param a
     * @param b
     * @param {Lifetime} lifetime
     * @param {Type} TService
     * @param {Type} TImplementation
     * @private
     */
    private addServiceDescriptorFromArguments(a: any, b: any, lifetime: Lifetime, TService?: Type, TImplementation?: Type)
    {
        let serviceIdentifier: string;
        let implementation: any = b;

        // No arguments, use generic arguments
        if (a === undefined)
        {
            const serviceType = TService;
            const implementationType = TImplementation;

            if (!serviceType) throw new Error("No service specified.");
            if (!implementationType) throw new Error("No implementation specified.");

            serviceIdentifier = serviceType.fullName;
            implementation = implementationType;
        }
        // No second argument, use first generic argument as service and first argument as value
        else if (b === undefined)
        {
            const serviceType = TService;
            if (!serviceType) throw new Error("No service specified.");

            serviceIdentifier = serviceType.fullName;
            implementation = a;
        }
        // both arguments set
        else
        {
            serviceIdentifier = Object.getPrototypeOf(implementation.constructor).name == "Type" ? a.fullName : a;
            implementation = b;
        }

        this.addServiceDescriptor(
            TypedServiceCollection.getServiceDescriptor(serviceIdentifier, implementation, Lifetime.Scoped)
        );
    }

    /**
     * Add dependency into the collection.
     * @param entry
     */
    add(entry: ServiceDescriptor | ServiceCollectionEntry): IServiceCollection;
    add(collection: IServiceCollection): IServiceCollection;
    add(entry: ServiceDescriptor | ServiceCollectionEntry | IServiceCollection): IServiceCollection
    {
        if (TypedServiceCollection.isServiceDescriptor(entry))
        {
            this.addServiceDescriptor(entry);
        }
        else if (TypedServiceCollection.isServiceCollectionEntry(entry))
        {
            for (let descriptor of entry.descriptors)
            {
                this.addServiceDescriptor(descriptor);
            }
        }
        else if (TypedServiceCollection.isIServiceCollection(entry))
        {
            for (let collection of entry.services)
            {
                for (let descriptor of collection.descriptors)
                {
                    this.addServiceDescriptor(descriptor);
                }
            }
        }

        return this;
    }

    addScoped<TService, TImplementation>(): IServiceCollection;
    addScoped<TService>(instance: any): IServiceCollection;
    addScoped<TService>(factory: ServiceFactory): IServiceCollection;
    addScoped(serviceType: Type, implementation: Type): IServiceCollection;
    addScoped(serviceType: Type, instance: any): IServiceCollection;
    addScoped(serviceType: Type, factory: ServiceFactory): IServiceCollection;
    addScoped(serviceType: string, implementation: Type): IServiceCollection;
    addScoped(serviceType: string, instance: any): IServiceCollection;
    addScoped(serviceType: string, factory: ServiceFactory): IServiceCollection;
    /**
     * @reflectGeneric
     * @param a
     * @param b
     * @return {IServiceCollection}
     */
    addScoped<TService, TImplementation>(a?: any, b?: any): IServiceCollection
    {
        this.addServiceDescriptorFromArguments(a, b, Lifetime.Scoped, getType<TService>(), getType<TImplementation>());
        return this;
    }

    addSingleton<TService, TImplementation>(): IServiceCollection;
    addSingleton<TService>(instance: any): IServiceCollection;
    addSingleton<TService>(factory: ServiceFactory): IServiceCollection;
    addSingleton(serviceType: Type, implementation: Type): IServiceCollection;
    addSingleton(serviceType: Type, instance: any): IServiceCollection;
    addSingleton(serviceType: Type, factory: ServiceFactory): IServiceCollection;
    addSingleton(serviceType: string, implementation: Type): IServiceCollection;
    addSingleton(serviceType: string, instance: any): IServiceCollection;
    addSingleton(serviceType: string, factory: ServiceFactory): IServiceCollection;
    /**
     * @reflectGeneric
     * @param a
     * @param b
     * @return {IServiceCollection}
     */
    addSingleton<TService, TImplementation>(a?: any, b?: any): IServiceCollection
    {
        this.addServiceDescriptorFromArguments(a, b, Lifetime.Singleton, getType<TService>(), getType<TImplementation>());
        return this;
    }

    addTransient<TService, TImplementation>(): IServiceCollection;
    addTransient<TService>(instance: any): IServiceCollection;
    addTransient<TService>(factory: ServiceFactory): IServiceCollection;
    addTransient(serviceType: Type, implementation: Type): IServiceCollection;
    addTransient(serviceType: Type, instance: any): IServiceCollection;
    addTransient(serviceType: Type, factory: ServiceFactory): IServiceCollection;
    addTransient(serviceType: string, implementation: Type): IServiceCollection;
    addTransient(serviceType: string, instance: any): IServiceCollection;
    addTransient(serviceType: string, factory: ServiceFactory): IServiceCollection;
    /**
     * @reflectGeneric
     * @param a
     * @param b
     * @return {IServiceCollection}
     */
    addTransient<TService, TImplementation>(a?: any, b?: any): IServiceCollection
    {
        this.addServiceDescriptorFromArguments(a, b, Lifetime.Transient, getType<TService>(), getType<TImplementation>());
        return this;
    }

    /**
     * Returns descriptor for given parameters.
     * @param {string} serviceIdentifier
     * @param implementation
     * @param {Lifetime} lifetime
     * @return {ServiceDescriptor}
     * @private
     */
    private static getServiceDescriptor(serviceIdentifier: string, implementation: any, lifetime: Lifetime): ServiceDescriptor
    {
        if (Object.getPrototypeOf(implementation.constructor).name == "Type")
        {
            return {
                serviceIdentifier: serviceIdentifier,
                lifetime: lifetime,
                implementationFactory: TypedServiceCollection.getTypeFactory(implementation)
            };
        }

        if (typeof implementation == "function")
        {
            return {
                serviceIdentifier: serviceIdentifier,
                lifetime: lifetime,
                implementationFactory: implementation
            };
        }

        return {
            serviceIdentifier: serviceIdentifier,
            lifetime: lifetime,
            implementationValue: implementation
        };
    }
}