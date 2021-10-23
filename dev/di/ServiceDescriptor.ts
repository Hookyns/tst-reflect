import { Lifetime }       from "./Lifetime";
import { ServiceFactory } from "./ServiceFactory";

export interface ServiceDescriptor
{
    serviceIdentifier: string;
    lifetime: Lifetime;
    implementationFactory?: ServiceFactory;
    implementationValue?: any;
}