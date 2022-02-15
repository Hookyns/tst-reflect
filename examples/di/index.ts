import { getType, Type } from "tst-reflect";

class ServiceCollection {
	public readonly services: Array<[Type, any]> = [];

	addTransient(dependencyType: Type, dependencyImplementation: Type | any) {
		this.services.push([dependencyType, dependencyImplementation]);
	}
}

class ServiceProvider {
	private readonly serviceCollection: ServiceCollection;

	constructor(serviceCollection: ServiceCollection) {
		this.serviceCollection = serviceCollection;
	}

	async getService<TDependency>(type: Type): Promise<TDependency> {
		// Find implementation of type
		const [, impl] = this.serviceCollection.services.find(([dep]) => dep.is(type));

		if (!impl) {
			throw new Error(`No implementation registered for '${type.name}'`);
		}

		if (!(impl instanceof Type)) {
			return impl;
		}

		if (!impl.isClass()) {
			throw new Error("Registered implementation is not class.");
		}

		const Ctor = await impl.getCtor();

		// Parameter-less
		if (!impl.getConstructors()?.length) {
			return Reflect.construct(Ctor, []);
		}

		// Ctor with less parameters preferred
		const ctor = impl.getConstructors().slice().sort((a, b) => a.getParameters().length > b.getParameters().length ? 1 : 0)[0];

		// Resolve parameters
		const argsPromises = [];
		ctor.getParameters().forEach(param => argsPromises.push(this.getService(param.type)));
		const args = await Promise.all(argsPromises);

		return Reflect.construct(Ctor, args);
	}
}

interface IPrinter {
	printHelloWorld();
	printText(text: string);
}

class ConsolePrinter implements IPrinter {
	private readonly console: typeof console;

	constructor(_console: typeof console) {
		this.console = _console;
	}

	printHelloWorld() {
		this.console.log("Hello World!")
	}

	printText(text: string) {
		this.console.log(text)
	}
}

//-----------------------------------------

const collection = new ServiceCollection();

collection.addTransient(getType<IPrinter>(), getType<ConsolePrinter>());
collection.addTransient(getType<typeof console>(), console);

const provider = new ServiceProvider(collection);

//-----------------------------------------

(async function() {
	try {
		const printer = await provider.getService<IPrinter>(getType<IPrinter>());

		console.log("printer is instanceof ConsolePrinter:", printer instanceof ConsolePrinter);

		printer.printHelloWorld();
		printer.printText("Try it on repl.it");
		printer.printText("And good bye!");
	} catch (e)
	{
		console.error(e);
	}
})();