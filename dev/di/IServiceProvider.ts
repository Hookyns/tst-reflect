import { Type } from "../../runtime";

export interface IServiceProvider
{
    /**
     * Resolve and return Iterable with instances of all registered implementations for the service.
     * @reflectGeneric
     */
    getServices<TService>(): Iterable<TService>;

    /**
     * Resolve and return Iterable with instances of all registered implementations for the service.
     * @param type
     */
    getServices<TService>(type: Type): Iterable<TService>;

    /**
     * Resolve and return Iterable with instances of all registered implementations for the service.
     * @param serviceIdentifier
     */
    getServices<TService>(serviceIdentifier: string): Iterable<TService>;

    
    /**
     * Resolve and return instance of last registered implementation of the service.
     * @reflectGeneric
     */
    getService<TService>(): TService;

    /**
     * Resolve and return instance of last registered implementation of the service.
     * @param type
     */
    getService<TService>(type: Type): TService;

    /**
     * Resolve and return instance of last registered implementation of the service.
     * @param serviceIdentifier
     */
    getService<TService>(serviceIdentifier: string): TService;
}