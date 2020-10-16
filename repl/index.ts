import {getType}           from "tst-reflect";
import {ServiceCollection} from "./ServiceCollection";
import {ServiceProvider}   from "./ServiceProvider";

interface ILog
{
	log(message: string);
}

class Log implements ILog
{
	log(message: string)
	{
		console.log(message);
	}
}

interface IService
{
	doJob();
}

class Service implements IService
{
	private log: ILog;

	constructor(log: ILog)
	{
		this.log = log;
	}

	doJob()
	{
		const job = 1 + 1;
		this.log.log(`1 + 1 = ${job}`);
	}
}

const serviceCollection = new ServiceCollection();
serviceCollection.addTransient(getType<ILog>(), getType<Log>());
serviceCollection.addTransient(getType<IService>(), getType<Service>());

const serviceProvider = new ServiceProvider(serviceCollection);

const s1 = serviceProvider.getService<IService>(getType<IService>());
console.log("Type created using reflection: ", s1);

if (s1) {
	s1.doJob();
}