import type { IServiceProvider } from "./IServiceProvider";

export type ServiceFactory<TService extends {} = {}> = (serviceProvider: IServiceProvider) => TService | undefined;