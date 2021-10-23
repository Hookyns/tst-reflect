import {
	getType,
	Type
}                                 from "../../runtime";
import { IServiceCollection }     from "./IServiceCollection";
import { IServiceProvider }       from "./IServiceProvider";
import { ServiceCollectionEntry } from "./ServiceCollectionEntry";

export class TypedServiceProvider implements IServiceProvider
{
    /**
     * Service collection
     */
    private readonly _serviceCollection: IServiceCollection;

    /**
     * Create service provider on top of service collection.
     * @param serviceCollection
     */
    constructor(serviceCollection: IServiceCollection)
    {
        this._serviceCollection = serviceCollection;
    }

    getServices<TService>(): Iterable<TService>;
    getServices<TService>(type: Type): Iterable<TService>;
    getServices<TService>(serviceIdentifier: string): Iterable<TService>;
    getServices<TService>(type?: Type | string): Iterable<TService>
    {
        if (type === undefined)
        {
            type = getType<TService>();

            if (!type)
            {
                throw new Error("No service specified.");
            }
        }

        const serviceIdentifier: string = typeof type == "string" ? type : type.fullName;
        const entry: ServiceCollectionEntry | undefined = Array.from(this._serviceCollection.services).find(entry => entry.serviceIdentifier == serviceIdentifier);

        if (!entry)
        {
            throw new Error(`No service '${serviceIdentifier}' registered.`);
        }

        const self = this;

        return {
            [Symbol.iterator]: function* () {
                for (let descriptor of entry.descriptors)
                {
                    if (typeof descriptor.implementationFactory == "function")
                    {
                        // TODO: Use Lifetime scopes
                        yield descriptor.implementationFactory(self);
                    }
                    else
                    {
                        yield descriptor.implementationValue;
                    }
                }
            }
        };
    }

    getService<TService>(): TService;
    getService<TService>(type: Type): TService;
    getService<TService>(serviceIdentifier: string): TService;
    getService<TService>(type?: Type | string): TService
    {
        if (type === undefined)
        {
            type = getType<TService>();

            if (!type)
            {
                throw new Error("No service specified.");
            }
        }

        const serviceIdentifier: string = typeof type == "string" ? type : type.fullName;
        const service = this.getServices(serviceIdentifier)[Symbol.iterator]().next().value;

        if (service === undefined)
        {
            throw new Error(`No service '${serviceIdentifier}' registered.`);
        }
        
        return service;
    }
}