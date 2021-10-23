import { ServiceDescriptor } from "./ServiceDescriptor";

export interface ServiceCollectionEntry
{
    serviceIdentifier: string;
    descriptors: Array<ServiceDescriptor>;
}