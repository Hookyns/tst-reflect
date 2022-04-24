export interface ISomeInterface {
	reflection?: boolean;
	get name(): string;
	doSomething(): void;
}

export class SomeParentClass implements ISomeInterface {
	reflection?: boolean;
	using = "tst-reflect";
	get name(): string {
		return "SomeParentClass";
	}
	
	doSomething(): void {
		console.log("SomeParentClass did something.");
	}
}

export class SomeClass extends SomeParentClass {
	private readonly _name: string;	
	reflection = true;
	using = "tst-reflect";
	get name(): string {
		return this._name;
	}
	
	constructor()
	constructor(name: string)
	constructor(name?: string) {
		super();
		this._name = name || "SomeClass";
	}
	
	doSomething(): void {
		console.log("SomeClass did something.");
	}

	doSomethingElse(): void {
		console.log(`SomeClass '${this.name}' did something else.`);
	}
}