export class AnotherTestingClass {
	public name: string;

	constructor(name: string) {
		this.name = name;
	}

	someMethod(name: string) {}
}


export class TestingClass {
	private name: string;
	public anotherTestingClass: AnotherTestingClass = null;

	constructor(name: string, anotherTestingClass?: AnotherTestingClass) {
		this.name                = name;
		this.anotherTestingClass = anotherTestingClass;
	}

	someMethod(name: string) {}
}

