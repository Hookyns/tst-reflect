import {getType, Type}              from "../runtime";
import {IService, myFunc2, Service} from "./dependency";

export function myFunc<T, U = any>(val: U)
{
	const t = getType<T>();
	const x = getType<IService>();
	console.log(val, t, "IService:", x);
}

myFunc2<IService>("IService:");
myFunc<Service>("Service:");

const logger = {
	log(msg)
	{
		console.log(msg);
	}
};

const s2 = new Service(logger);
s2.whoAmI();


// ######################################################


class ServiceCollection
{
	public readonly services: Array<[Type, any]> = [];

	addTransient(dependencyType: Type, dependencyImplementation: Type | any)
	{
		this.services.push([dependencyType, dependencyImplementation]);
	}
}

class ServiceProvider
{
	private readonly serviceCollection: ServiceCollection;

	constructor(serviceCollection: ServiceCollection)
	{
		this.serviceCollection = serviceCollection;
	}

	getService<TDependency>(type: Type): TDependency
	{
		// Find implementation of type
		const [, impl] = this.serviceCollection.services.find(([dep]) => dep.is(type));

		if (!impl)
		{
			throw new Error(`No implementation registered for '${type.name}'`);
		}

		if (!(impl instanceof Type))
		{
			return impl;
		}

		if (!impl.isClass())
		{
			throw new Error("Registered implementation is not class.");
		}

		// Parameter-less
		if (!impl.getConstructors()?.length)
		{
			return Reflect.construct(impl.ctor, []);
		}

		// Ctor with less parameters preferred
		const ctor = impl.getConstructors().sort((a, b) => a.parameters.length > b.parameters.length ? 1 : 0)[0];

		// Resolve parameters
		const args = ctor.parameters.map(param => this.getService(param.type))

		return Reflect.construct(impl.ctor, args);
	}
}

interface IPrinter
{
	printHelloWorld();

	printText(text: string);
}

class ConsolePrinter implements IPrinter
{
	private readonly console: Console;

	constructor(console: Console)
	{
		this.console = console;
	}

	printHelloWorld()
	{
		this.console.log("Hello World!")
	}

	printText(text: string)
	{
		this.console.log(text)
	}
}

//-----------------------------------------

const collection = new ServiceCollection();

collection.addTransient(getType<IPrinter>(), getType<ConsolePrinter>());
collection.addTransient(getType<Console>(), console);

const provider = new ServiceProvider(collection);

//-----------------------------------------

const printer = provider.getService<IPrinter>(getType<IPrinter>());
console.log("printer is instanceof ConsolePrinter:", printer instanceof ConsolePrinter);

printer.printHelloWorld();
printer.printText("Try it on repl.it");
printer.printText("And good bye!");