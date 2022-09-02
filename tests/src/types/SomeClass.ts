import { SomeType } from "./dir/SomeType";

export class SomeClass {
	prop: true = true;
	public readonly readonlyProp: SomeType<Error>;

	get getter(): SomeType<Error> {
		return this.readonlyProp;
	}

	set setter(val: SomeType<Error>) {
	}

	constructor();
	constructor(a?: boolean);
	constructor(b?: string);
	constructor(a: boolean, b?: string);
	constructor(private aOrB?: boolean | string, b?: string) {
		this.readonlyProp = b === undefined ? false : new Error();
	}

	someMethod<T>(a?: boolean): void;
	someMethod(b?: string): string;
	someMethod<T>(aOrB?: boolean | string): void | string {}

	someOtherMethod(): number {
		return Math.random();
	}

	someOptionalMethod?(): boolean {
		return this.prop;
	}
}