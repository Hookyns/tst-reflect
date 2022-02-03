import {
	getType,
	Type
}                                 from "tst-reflect";
import { IServiceCollection }     from "./IServiceCollection";
import { IServiceProvider }       from "./IServiceProvider";
import { TypedServiceCollection } from "./TypedServiceCollection";
import { TypedServiceProvider }   from "./TypedServiceProvider";

interface ILog
{
	log(...args: any[]);
}

class Log implements ILog
{
	log(...args: any[])
	{
		console.log.apply(undefined, args);
	}
}

interface IService
{
	doJob(number: number);
}

// @inject()
class Service implements IService
{
	private log: ILog;

	constructor(log: ILog)
	{
		this.log = log;
	}

	doJob(number: number)
	{
		const job = number + number;
		this.log.log(`${number} + ${number} = ${job}`);
	}
}

const col: IServiceCollection = new TypedServiceCollection();
col.addTransient(getType<ILog>(), getType<Log>());
col.addTransient<IService, Service>();

const serviceProvider: IServiceProvider = new TypedServiceProvider(col);

const logger = serviceProvider.getService<ILog>();
const service = serviceProvider.getService<IService>();

logger.log("Type constructed using reflection: ", service);

if (service)
{
	service.doJob(Math.E);
}

// import { getType, Type }           from "../../runtime";
// import { inject }            from "./inject";
// import { ServiceCollection } from "./ServiceCollection";
// import { ServiceProvider }   from "./ServiceProvider";
//
// interface ILog
// {
// 	log(...args: any[]);
// }
//
// class Log implements ILog
// {
// 	log(...args: any[])
// 	{
// 		console.log.apply(undefined, args);
// 	}
// }
//
// interface IService
// {
// 	doJob(number: number);
// }
//
// // @inject()
// class Service implements IService
// {
// 	private log: ILog;
//
// 	constructor(log: ILog)
// 	{
// 		this.log = log;
// 	}
//
// 	doJob(number: number)
// 	{
// 		const job = number + number;
// 		this.log.log(`${number} + ${number} = ${job}`);
// 	}
// }
//
// // const serviceCollection = new ServiceCollection();
// // serviceCollection.addTransient(getType<ILog>(), getType<Log>());
// // serviceCollection.addTransient<IService, Service>();
// //
// // const serviceProvider = new ServiceProvider(serviceCollection);
// //
// // const logger = serviceProvider.getService<ILog>();
// // const service = serviceProvider.getService<IService>();
// //
// // logger.log("Type constructed using reflection: ", service);
// //
// // if (service)
// // {
// // 	service.doJob(Math.E);
// // }
//
//
// export interface IServiceCollection
// {
// 	/**
// 	 * Add transient dependency into the collection.
// 	 * @reflectGeneric
// 	 */
// 	addTransient<TService, TImplementation>(): IServiceCollection;
//
// 	/**
// 	 * Add transient dependency into the collection.
// 	 * @reflectGeneric
// 	 * @param instance
// 	 */
// 	addTransient<TService>(instance: any): IServiceCollection;
//
// 	/**
// 	 * Add transient dependency into the collection.
// 	 * @param serviceType
// 	 * @param implementation
// 	 */
// 	addTransient(serviceType: Type, implementation: Type): IServiceCollection;
// }
//
// const col = null as IServiceCollection;
// col.addTransient<ILog, Log>();
