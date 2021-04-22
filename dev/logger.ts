import {getType, Type} from "tst-reflect";
import "./metadata.lib";

function inferType<TType>() {
	return getType<TType>().name;
}

const val = 5;
console.log(inferType<typeof val>()); // "number" - but it is and number literal with value 5, more info in docs





// import {reflectGeneric} from "../runtime/reflect";

interface ILogger {}

abstract class LoggerFactory {
	/**
	 * @ reflectGeneric
	 * @param categoryName
	 */
	createLogger<TCategory = undefined>(...categoryName: TCategory extends undefined ? [string] : []): ILogger
	{
		const type = getType<TCategory>();
		console.dir(type);
		const category = categoryName?.[0] ?? type?.name;
		console.log(category);
		return {};
	}
}

class DefaultLoggerFactory extends LoggerFactory {

}

class Builder {
	build(): LoggerFactory {
		return new DefaultLoggerFactory();
	}
}

class SomeType {
	array: Array<{ foo: string, bar: string }> = [];
}

const factory = new Builder().build();
factory.createLogger<{foo: string, bar: "a" | "b"}>();
factory.createLogger<[fo: string]>();
factory.createLogger<SomeType>();

class Foo
{
	prop: number;

	constructor(prop: number)
	{
		this.prop = prop;
	}
}

const variable: Foo = new Foo(5);
console.log(getType<Foo>());
console.log(getType<typeof variable>());