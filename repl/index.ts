import { getType }           from "tst-reflect";
import { ServiceCollection } from "./ServiceCollection";
import { ServiceProvider }   from "./ServiceProvider";

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

const serviceCollection = new ServiceCollection();
serviceCollection.addTransient(getType<ILog>(), getType<Log>());
serviceCollection.addTransient<IService, Service>();

const serviceProvider = new ServiceProvider(serviceCollection);

const logger = serviceProvider.getService<ILog>();
const service = serviceProvider.getService<IService>();

logger.log("Type constructed using reflection: ", service);

if (service)
{
    service.doJob(Math.E);
}