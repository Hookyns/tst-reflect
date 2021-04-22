import {getType, Type}  from "tst-reflect";

class ServiceCollection
{
	public readonly services: Array<[Type, any]> = [];

	addTransient<TDep, TImp = undefined>(dependencyType?: Type, dependencyImplementation?: Type | any)
	{
		this.services.push([dependencyType ?? getType<TDep>(), dependencyImplementation ?? getType<TImp>()]);
	}
}

class ServiceProvider
{
	private readonly serviceCollection: ServiceCollection;

	constructor(serviceCollection: ServiceCollection)
	{
		this.serviceCollection = serviceCollection;
	}

	getService<TDependency>(type?: Type): TDependency
	{
		type = type || getType<TDependency>();

		// Find implementation of type
		const arr = this.serviceCollection.services.find(([dep]) => dep.is(type));
		const impl = arr[1];

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

interface IPrinter {
	printHelloWorld();
	print(...args: any[]);

	/**
	 * @reflectGeneric
	 * @param args
	 */
	printType<T>(...args: any[]);
}

abstract class BasePrinter implements IPrinter {
	abstract printHelloWorld();
	abstract print(...args: any[]);
	/** @reflectGeneric */
	abstract printType<T>(...args: any[]);
}

class ConsolePrinter extends BasePrinter implements IPrinter
{
	private readonly console: Console;

	constructor(console: Console)
	{
		super();
		this.console = console;
	}

	printHelloWorld()
	{
		this.console.log("Hello World!");
	}

	print(...args: any[])
	{
		this.console.log(...args);
	}

	printType<T>(...args: any[])
	{
		this.console.log(...args, getType<T>());
	}
}

//-----------------------------------------

const collection = new ServiceCollection();

collection.addTransient<IPrinter, ConsolePrinter>(undefined, getType<ConsolePrinter>());
collection.addTransient<BasePrinter, ConsolePrinter>(); // Working generic!!
collection.addTransient<Console>(undefined, console);

const provider = new ServiceProvider(collection);

//-----------------------------------------

const printer = provider.getService<IPrinter>();
console.log("printer is instanceof ConsolePrinter:", printer instanceof ConsolePrinter);

printer.printHelloWorld();
printer.print("Try it on repl.it");
printer.print("And good bye!", getType<IPrinter>());
(printer as ConsolePrinter).printType<ConsolePrinter>("ConsolePrinter: ");